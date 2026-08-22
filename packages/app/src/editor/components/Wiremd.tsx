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

import { Trans, useLingui } from '@lingui/react/macro';
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
  /** Error detail for the fatal banner (compile diagnostics / load failure). */
  errorText: string;
  /**
   * Why the fatal banner is showing: 'diagnostic' carries embed diagnostics,
   * 'oversize' means the size guard refused the source before compiling.
   */
  errorKind: 'diagnostic' | 'oversize';
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
 * Upper bound on fence source handed to the synchronous embed compile.
 *
 * compileWiremd runs on the editor main thread; measured cost is ~1 ms per
 * KiB (wiremd P3 evidence: 4.7 ms @ 100 rows / 4.7 KB, linear), so 100,000
 * characters bounds the worst compile at roughly one hundred milliseconds —
 * imperceptible at the 300 ms debounce cadence, and the guard refuses
 * anything beyond it instead of freezing typing/scrolling/collaboration.
 * Worker offload stays unnecessary while the cap holds; revisit both
 * together if real documents ever need more headroom.
 */
export const MAX_WIREMD_SOURCE_LENGTH = 100_000;

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
  const { t } = useLingui();
  const [state, setState] = useState<RenderState>({
    status: 'loading',
    html: '',
    css: '',
    errorText: '',
    errorKind: 'diagnostic',
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
      if (source.length > MAX_WIREMD_SOURCE_LENGTH) {
        // Refuse before touching the embed boundary: the sync compile would
        // block the editor main thread for a source this large.
        if (capturedRevision === revisionRef.current) {
          setState({
            status: 'error',
            html: '',
            css: '',
            errorText: '',
            errorKind: 'oversize',
            warnings: [],
          });
        }
        return;
      }
      void loadEmbed()
        .then((embed) => {
          if (cancelled || capturedRevision !== revisionRef.current) return;
          const compiled = embed.compileWiremd(source);
          // Fatal = no document at all, OR any error-severity diagnostic.
          // The embed contract permits a non-null document beside validator
          // errors (partial validity); rendering that as a confident,
          // banner-free frame would present incomplete output as complete.
          const fatalDiagnostic = compiled.diagnostics.find((d) => d.severity === 'error') ?? null;
          if (!compiled.document || fatalDiagnostic) {
            setState({
              status: 'error',
              html: '',
              css: '',
              errorText: fatalDiagnostic?.message ?? '',
              errorKind: 'diagnostic',
              warnings: [],
            });
            return;
          }
          const preview = embed.renderToPreview(compiled.document, {
            classPrefix: 'ok-wiremd-',
            style: VALID_STYLES.has(style ?? '') ? (style as never) : (compiled.style ?? 'sketch'),
          });
          if (capturedRevision !== revisionRef.current) return;
          const previewError = preview.diagnostics.find((d) => d.severity === 'error');
          if (previewError) {
            setState({
              status: 'error',
              html: '',
              css: '',
              errorText: previewError.message,
              errorKind: 'diagnostic',
              warnings: [],
            });
            return;
          }
          // Omissions come from BOTH stages: compile diagnostics carry
          // parser drops (unsupported constructs); preview diagnostics carry
          // policy substitutions. Both mean "rendered output is not the whole
          // source" and must surface.
          setState({
            status: 'ready',
            html: preview.html,
            css: preview.css,
            errorText: '',
            errorKind: 'diagnostic',
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
            errorKind: 'diagnostic',
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
              {state.errorKind === 'oversize'
                ? t`This wireframe source is too large to preview. Source is unchanged.`
                : state.errorText !== ''
                  ? state.errorText
                  : t`Could not compile the wireframe.`}
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
          title={t`Wireframe preview`}
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
