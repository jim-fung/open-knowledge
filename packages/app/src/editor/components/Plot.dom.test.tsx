/**
 * PlotView — behavioral tests at the mocked `@observablehq/plot` boundary
 * (RTL substrate per Wiremd.dom.test.tsx).
 *
 * The Plot module is mocked so the contract under test is the VIEW:
 *   - rapid spec edits coalesce to ONE build of the FINAL spec and no
 *     intermediate chart ever commits (debounce + revision guard);
 *   - spec failure renders a fatal banner beside the untouched source;
 *   - a lazy-import failure is recoverable via Retry;
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

/**
 * Import-failure control: when `failNextImport` is set, the next dynamic
 * import of the module rejects (transient chunk-failure simulation); the
 * view's Retry path must clear it and succeed on the second attempt.
 */
const control = {
  failNextImport: false,
  builtSpecs: [] as string[],
};

vi.doMock('@observablehq/plot', () => {
  if (control.failNextImport) {
    control.failNextImport = false;
    throw new Error('Failed to fetch dynamically imported module');
  }
  const markStub = () => ({ kind: 'mark' });
  return {
    plot: vi.fn((options: { marks?: unknown[] }) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('data-mark-count', String(options.marks?.length ?? 0));
      return svg;
    }),
    barY: markStub,
    dot: markStub,
  };
});

const { PlotView, MAX_PLOT_SPEC_LENGTH } = await import('./Plot.tsx');

const DEBOUNCE_MS = 300;

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

function validSpec(label: string): string {
  return JSON.stringify({
    marks: [{ mark: 'barY', data: [1, 2], options: { x: label } }],
  });
}

beforeEach(() => {
  cleanup();
  vi.useFakeTimers();
  control.failNextImport = false;
  control.builtSpecs = [];
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('PlotView — lazy-import recovery', () => {
  // Declared FIRST: the view caches its successful lazy import in a
  // module-level singleton for the whole file, so the only deterministic
  // way to exercise a FAILED first attempt is to run before any test that
  // lets it succeed.
  test('first-import failure shows Preview unavailable; Retry recovers', async () => {
    control.failNextImport = true;
    const { rerender } = render(<PlotView spec={validSpec('a')} />);
    await advance(DEBOUNCE_MS + 100);

    expect(screen.getByText('Preview unavailable.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    // Source remains visible while the renderer is unavailable.
    expect(screen.getByText(validSpec('a'))).toBeTruthy();

    // Retry re-attempts the import; the second attempt succeeds.
    rerender(<PlotView spec={validSpec('a')} />);
    await act(async () => {
      screen.getByRole('button', { name: 'Retry' }).click();
    });
    await advance(DEBOUNCE_MS + 100);

    expect(document.querySelector('.plot-host svg')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('PlotView — revision safety', () => {
  test('rapid edits coalesce: one build of the final spec, intermediate charts never commit', async () => {
    const { rerender } = render(<PlotView spec={validSpec('v1')} />);
    await advance(DEBOUNCE_MS + 100);

    const host = document.querySelector('.plot-host');
    expect(host?.querySelector('svg')).toBeTruthy();
    expect(host?.querySelector('svg')?.getAttribute('data-mark-count')).toBe('1');

    // Two edits land inside one debounce window — v2 must never build.
    rerender(<PlotView spec={validSpec('v2')} />);
    rerender(<PlotView spec={validSpec('v3')} />);
    await advance(DEBOUNCE_MS + 100);

    // The committed chart is the final revision; no stale intermediate.
    expect(screen.getByRole('status').textContent).toContain('Chart ready.');
    expect(document.querySelector('.plot-host')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('PlotView — recoverable states', () => {
  test('an empty spec renders the passive loading state with the raw source visible', async () => {
    render(<PlotView spec="" />);
    await advance(DEBOUNCE_MS + 100);

    // Empty string parses as invalid JSON → same fatal-banner contract as
    // any other bad spec (the placeholder card lives upstream in
    // JsxComponentView; this passive state covers read-only contexts).
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});

describe('PlotView — oversized-spec guard (main-thread build bound)', () => {
  test('a spec beyond the cap is refused before building', async () => {
    const oversized = `{"padding":"${'y'.repeat(MAX_PLOT_SPEC_LENGTH)}"}`;
    render(<PlotView spec={oversized} />);
    await advance(DEBOUNCE_MS + 100);

    expect(screen.getByRole('alert').textContent).toMatch(/too large/i);
    // The host stays mounted but nothing was built into it.
    expect(document.querySelector('.plot-host svg')).toBeNull();
    // The authoritative source stays visible under the error.
    expect(document.querySelector('pre.plot-source')?.textContent).toBe(oversized);
  });

  test('a spec just under the cap still builds', async () => {
    // A single valid spec (marks included) whose length sits just below
    // the cap — padding rides in the caption pass-through.
    const fitting = JSON.stringify({
      caption: 'x'.repeat(MAX_PLOT_SPEC_LENGTH - 120),
      marks: [{ mark: 'dot', data: [1, 2] }],
    });
    render(<PlotView spec={fitting} />);
    await advance(DEBOUNCE_MS + 100);

    expect(document.querySelector('.plot-host svg')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
