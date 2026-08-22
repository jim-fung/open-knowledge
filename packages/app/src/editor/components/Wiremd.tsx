/**
 * WiremdFenceView — lazy renderer for promoted ` ```wiremd ` fences.
 *
 * Consumes the browser-safe `wiremd/embed` boundary (compileWiremd +
 * renderToPreview) exactly as the embed contract prescribes:
 *
 *   - lazy dynamic import with rejection-cache clearing (Mermaid pattern),
 *     so documents without wiremd fences pay nothing and a transient chunk
 *     failure is retryable;
 *   - every source change bumps a revision; the compile captures it and the
 *     commit path discards any result whose revision is no longer current —
 *     a slow compile for revision N can never replace revision N+1;
 *   - the fence source is authoritative: compile/render failure renders
 *     diagnostics BESIDE the source and never writes back to the node;
 *   - the preview mounts in a sandboxed iframe (`sandbox=""` — no scripts,
 *     no same-origin) as defense in depth; the payload itself is already
 *     script-free by renderer policy.
 *
 * Copyright (c) 2025 wiremd × OpenKnowledge integration.
 */

import { Trans } from '@lingui/react/macro';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils.ts';

interface WiremdProps {
  source?: string;
  /** wiremd visual style; validated against the embed style list. */
  style?: string;
  className?: string;
}

type EmbedModule = typeof import('wiremd/embed');

interface RenderState {
  status: 'loading' | 'ready' | 'error' | 'load-failed';
  html: string;
  css: string;
  /** Error text for the fatal banner (compile failure / load failure). */
  errorText: string;
  /** Non-fatal notes (unsupported constructs, substitutions). */
  warnings: string[];
}

const VALID_STYLES = new Set([
  'sketch',
  'clean',
  'wireframe',
  'none',
  'tailwind',
  'material',
  'brutal',
]);

/** Debounce window for compile-on-type (VS Code extension's proven value). */
const COMPILE_DEBOUNCE_MS = 300;

/**
 * One-time lazy load. Cleared on rejection so a later source edit (or the
 * Retry button) re-attempts the import — without this, a transient chunk
 * failure would disable wiremd previews for the whole session.
 */
let embedPromise: Promise<EmbedModule> | null = null;
function loadEmbed(): Promise<EmbedModule> {
  embedPromise ||= import('wiremd/embed').catch((err) => {
    embedPromise = null;
    throw err;
  });
  return embedPromise;
}

function buildSrcdoc(html: string, css: string): string {
  // Fixed light canvas: wiremd styles are light-designed; the frame pins
  // its own color-scheme rather than inheriting the host theme.
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
${css}
</style>
</head>
<body style="margin: 0; color-scheme: light;">
${html}
</body>
</html>`;
}

export function WiremdView({ source = '', style, className }: WiremdProps) {
  const [state, setState] = useState<RenderState>({
    status: 'loading',
    html: '',
    css: '',
    errorText: '',
    warnings: [],
  });
  // Bumped by Retry to re-run the effect after a lazy-import failure.
  const [loadAttempt, setLoadAttempt] = useState(0);

  // Revision guard: the effect captures the revision at request time and
  // only the latest capture may commit. Sync compilation narrows the race
  // window but React state commits are still asynchronous — and any future
  // async step behind the boundary reintroduces full staleness.
  const revisionRef = useRef(0);

  useEffect(() => {
    // Explicit read: loadAttempt is a deliberate re-trigger signal (Retry
    // after a lazy-import failure), not data consumed by the body.
    void loadAttempt;
    const capturedRevision = ++revisionRef.current;
    let cancelled = false;

    const timer = setTimeout(() => {
      void loadEmbed()
        .then((embed) => {
          if (cancelled || capturedRevision !== revisionRef.current) return;
          const compiled = embed.compileWiremd(source);
          if (!compiled.document) {
            setState({
              status: 'error',
              html: '',
              css: '',
              errorText:
                compiled.diagnostics.find((d) => d.severity === 'error')?.message ??
                'Could not compile the wireframe.',
              warnings: [],
            });
            return;
          }
          const preview = embed.renderToPreview(compiled.document, {
            classPrefix: 'ok-wiremd-',
            style: VALID_STYLES.has(style ?? '') ? (style as never) : 'sketch',
          });
          if (capturedRevision !== revisionRef.current) return;
          // Omissions come from BOTH stages: compile diagnostics carry
          // parser drops (unsupported constructs) and validator errors;
          // preview diagnostics carry policy substitutions. Both mean
          // "rendered output is not the whole source" and must surface.
          setState({
            status: 'ready',
            html: preview.html,
            css: preview.css,
            errorText: '',
            warnings: [...compiled.diagnostics, ...preview.diagnostics]
              .filter((d) => d.severity === 'warning')
              .map((d) => d.message),
          });
        })
        .catch((err: unknown) => {
          if (cancelled || capturedRevision !== revisionRef.current) return;
          setState({
            status: 'load-failed',
            html: '',
            css: '',
            errorText: err instanceof Error ? err.message : String(err),
            warnings: [],
          });
        });
    }, COMPILE_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [source, style, loadAttempt]);

  const hasFatalProblem = state.status === 'error' || state.status === 'load-failed';
  const showPreview = state.status === 'ready';

  return (
    <div
      className={cn(
        'wiremd flex w-full flex-col overflow-hidden rounded-md border border-border/60 bg-background',
        className,
      )}
      data-component-type-renderer="wiremd"
    >
      {/* Polite live region announcing state transitions for screen readers. */}
      <span role="status" aria-live="polite" className="sr-only">
        {showPreview ? (
          <Trans>Wireframe preview ready.</Trans>
        ) : hasFatalProblem ? (
          <Trans>Wireframe preview failed. Source is unchanged.</Trans>
        ) : (
          <Trans>Rendering wireframe</Trans>
        )}
      </span>

      {state.status === 'error' && (
        <div
          role="alert"
          className="mb-2 flex items-start gap-2 rounded border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive"
        >
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <div className="min-w-0">
            <div className="font-medium">
              <Trans>Couldn&apos;t render wireframe.</Trans>
            </div>
            <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] opacity-90">
              {state.errorText}
            </pre>
            <div className="mt-1 opacity-80">
              <Trans>Source is unchanged.</Trans>
            </div>
          </div>
        </div>
      )}

      {state.status === 'load-failed' && (
        <div
          role="alert"
          className="mb-2 flex items-start justify-between gap-2 rounded border border-warning/30 bg-warning/5 px-3 py-2 text-[12px]"
        >
          <div className="flex min-w-0 items-start gap-2">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <div className="min-w-0">
              <div className="font-medium">
                <Trans>Preview unavailable.</Trans>
              </div>
              <div className="mt-1 opacity-80">
                <Trans>The wireframe renderer didn&apos;t load. Source is intact.</Trans>
              </div>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setLoadAttempt((n) => n + 1)}
          >
            <Trans>Retry</Trans>
          </Button>
        </div>
      )}

      {showPreview && state.warnings.length > 0 && (
        <div className="flex items-start gap-2 border-b border-warning/30 bg-warning/5 px-3 py-2 text-[12px]">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <div className="min-w-0">
            <div className="font-medium">
              <Trans>Wireframe rendered with omissions.</Trans>
            </div>
            <div className="opacity-80">
              <Trans>Some content isn&apos;t supported yet and isn&apos;t shown.</Trans>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <iframe
          title="Wiremd wireframe preview"
          sandbox=""
          srcDoc={buildSrcdoc(state.html, state.css)}
          className="h-[360px] w-full border-0 bg-white"
          // contentEditable=false keeps ProseMirror from treating the frame
          // as an editable surface; the source modal is the edit surface.
          contentEditable={false}
        />
      )}

      {(state.status === 'loading' || hasFatalProblem) && (
        <pre className="wiremd-source m-0 max-h-48 overflow-auto px-3 py-2 font-mono text-[11px] opacity-70">
          {source}
        </pre>
      )}
    </div>
  );
}
