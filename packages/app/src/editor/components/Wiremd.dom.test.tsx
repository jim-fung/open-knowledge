/**
 * WiremdView — behavioral tests at the mocked `wiremd/embed` boundary
 * (kimi V1–V3/V7 equivalents; RTL substrate per Mermaid.dom.test.tsx).
 *
 * The embed module is mocked so the contract under test is the VIEW:
 *   - rapid source edits coalesce to ONE compile of the FINAL source and no
 *     intermediate preview ever commits (debounce + revision guard);
 *   - compile failure renders a recoverable error with the source intact;
 *   - omissions warnings surface from BOTH the compile stage (parser drops)
 *     and the preview stage (policy substitutions);
 *   - every non-ready state keeps the fence source visible — authoritative.
 *
 * Timer advancement goes through `act` + `advanceTimersByTimeAsync`; RTL's
 * `waitFor` polls on real timers and would hang under the fake clock.
 */

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderLinguiTemplate } from '@/test-utils/lingui-mock';

type WindowGlobals = { NodeFilter?: typeof NodeFilter; ResizeObserver?: unknown };
const globalWithDomShims = globalThis as typeof globalThis & WindowGlobals;
if (globalWithDomShims.NodeFilter === undefined && typeof window !== 'undefined') {
  globalWithDomShims.NodeFilter = window.NodeFilter;
}
if (globalWithDomShims.ResizeObserver === undefined) {
  class NoopResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalWithDomShims.ResizeObserver = NoopResizeObserver;
}

import * as actualLinguiMacro from '@lingui/react/macro';

vi.doMock('@lingui/react/macro', () => ({
  ...actualLinguiMacro,
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLingui: () => ({ t: renderLinguiTemplate }),
}));

interface Diagnostic {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  source: 'parser' | 'validator' | 'renderer' | 'include';
}

const control = {
  compileCalls: [] as string[],
  compileResult: (): {
    document: Record<string, unknown> | null;
    diagnostics: Diagnostic[];
    syntaxVersion: string;
  } => ({
    document: { type: 'document', version: '0.1', meta: {}, children: [] },
    diagnostics: [],
    syntaxVersion: '0.1',
  }),
  // Echoes the CURRENT holder value so assertions can tell WHICH revision
  // actually committed to the iframe.
  previewResult: (): {
    html: string;
    css: string;
    classPrefix: string;
    diagnostics: Diagnostic[];
  } => ({
    html: `<div data-marker="${currentSource.value}">preview</div>`,
    css: '.ok-wiremd-root {}',
    classPrefix: 'ok-wiremd-',
    diagnostics: [],
  }),
};

/** Latest source seen by the compile mock (readable inside previewResult). */
const currentSource: { value: string } = { value: '' };

vi.doMock('wiremd/embed', () => ({
  compileWiremd: (source: string) => {
    control.compileCalls.push(source);
    currentSource.value = source;
    return control.compileResult(source);
  },
  renderToPreview: () => control.previewResult(),
}));

const { WiremdView } = await import('./Wiremd.tsx');

const DEBOUNCE_MS = 300;

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

function previewFrame(): HTMLIFrameElement {
  return screen.getByTitle('Wiremd wireframe preview') as HTMLIFrameElement;
}

beforeEach(() => {
  cleanup();
  vi.useFakeTimers();
  control.compileCalls = [];
  currentSource.value = '';
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('WiremdView — revision safety (V7/V3)', () => {
  test('rapid edits coalesce: one compile of the final source, intermediate previews never commit', async () => {
    const { rerender } = render(<WiremdView source="source-v1" />);
    await advance(DEBOUNCE_MS + 100);

    expect(control.compileCalls).toEqual(['source-v1']);
    expect(previewFrame().srcdoc).toContain('data-marker="source-v1"');
    // Payload frame is sandboxed with no scripts and no same-origin.
    expect(previewFrame().getAttribute('sandbox')).toBe('');

    // Two edits land inside one debounce window — v2 must never compile.
    rerender(<WiremdView source="source-v2" />);
    rerender(<WiremdView source="source-v3" />);
    await advance(DEBOUNCE_MS + 100);

    // Only the FINAL revision compiled; the stale intermediate is discarded.
    expect(control.compileCalls).toEqual(['source-v1', 'source-v3']);
    expect(previewFrame().srcdoc).toContain('data-marker="source-v3"');
    expect(previewFrame().srcdoc).not.toContain('data-marker="source-v2"');
  });
});

describe('WiremdView — recoverable states (V1/V2)', () => {
  test('compile failure shows the error beside the untouched source', async () => {
    control.compileResult = () => ({
      document: null,
      diagnostics: [
        {
          severity: 'error',
          code: 'wmd-invalid-wiremd-ast',
          message: 'Buttons cannot contain other buttons (INVALID_NESTING)',
          source: 'validator',
        },
      ],
      syntaxVersion: '0.1',
    });

    render(<WiremdView source="[Outer] [ [Inner] ]" />);
    await advance(DEBOUNCE_MS + 100);

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain("Couldn't render wireframe.");
    expect(alert.textContent).toContain('INVALID_NESTING');
    expect(alert.textContent).toContain('Source is unchanged.');
    // The source stays visible under the error — never blanked.
    expect(screen.getByText('[Outer] [ [Inner] ]')).toBeTruthy();
    expect(screen.queryByTitle('Wiremd wireframe preview')).toBeNull();
  });

  test('compile-stage warnings surface the omissions banner over a live preview', async () => {
    control.compileResult = () => ({
      document: { type: 'document', version: '0.1', meta: {}, children: [] },
      diagnostics: [
        {
          severity: 'warning',
          code: 'wmd-unsupported-node',
          message: 'Unsupported markdown construct "html" was omitted.',
          source: 'parser',
        },
      ],
      syntaxVersion: '0.1',
    });

    render(<WiremdView source="<div>x</div>" />);
    await advance(DEBOUNCE_MS + 100);

    expect(previewFrame()).toBeTruthy();
    expect(screen.getByText('Wireframe rendered with omissions.')).toBeTruthy();
    expect(screen.getByText(/Some content isn't supported yet/)).toBeTruthy();
  });

  test('preview-stage policy warnings surface the same omissions banner', async () => {
    control.previewResult = () => ({
      html: '<div>partial</div>',
      css: '.x {}',
      classPrefix: 'ok-wiremd-',
      diagnostics: [
        {
          severity: 'warning',
          code: 'wmd-url-blocked',
          message: 'Blocked "javascript:" URL in preview content.',
          source: 'renderer',
        },
      ],
    });

    render(<WiremdView source="[link](javascript:alert(1))" />);
    await advance(DEBOUNCE_MS + 100);

    expect(previewFrame()).toBeTruthy();
    expect(screen.getByText('Wireframe rendered with omissions.')).toBeTruthy();
  });
});
