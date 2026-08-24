/**
 * PlotView — lazy renderer for promoted ` ```plot ` fences.
 *
 * The fence body is a JSON plot spec; `plot-spec.ts` builds real
 * @observablehq/plot marks from it on the editor main thread. The component
 * contract mirrors the Wiremd renderer exactly:
 *
 *   - lazy dynamic import with rejection-cache clearing (Mermaid pattern),
 *     so documents without plots pay nothing and a transient chunk failure
 *     is retryable;
 *   - every spec change bumps a revision; a slow render for revision N can
 *     never replace revision N+1;
 *   - the fence source is authoritative: parse/build failure renders the
 *     diagnostic BESIDE the source and never writes back to the node;
 *   - no author code ever executes — the spec names whitelisted mark
 *     factories and data, nothing callable (see `plot-spec.ts`).
 *
 * The chart mounts on a fixed light canvas (`bg-white`), matching the
 * wiremd precedent: plot colors are literal data-driven values, not theme
 * tokens, so a dark re-render would need per-scale restyling that v1
 * deliberately defers.
 */

import { Trans, useLingui } from '@lingui/react/macro';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils.ts';
import { renderPlotSpec } from './plot-spec.ts';

interface PlotProps {
  spec?: string;
  className?: string;
}

type PlotModule = typeof import('@observablehq/plot');

interface RenderState {
  status: 'loading' | 'ready' | 'error' | 'load-failed';
  /** Error detail for the fatal banner. */
  errorText: string;
}

/** Debounce window for render-on-type (same cadence as the wiremd preview). */
const RENDER_DEBOUNCE_MS = 300;

/**
 * Upper bound on fence source handed to the synchronous spec build. JSON
 * parsing + mark construction run on the editor main thread; like the
 * wiremd compile cap, 100,000 characters bounds the worst pass at well
 * under an interaction frame's patience while refusing pathological
 * sources instead of freezing typing/scrolling/collaboration.
 */
export const MAX_PLOT_SPEC_LENGTH = 100_000;

/**
 * One-time lazy load. Cleared on rejection so a later source edit (or the
 * Retry button) re-attempts the import — without this, a transient chunk
 * failure would disable plot previews for the whole session.
 */
let plotPromise: Promise<PlotModule> | null = null;
function loadPlot(): Promise<PlotModule> {
  plotPromise ||= import('@observablehq/plot').catch((err) => {
    plotPromise = null;
    throw err;
  });
  return plotPromise;
}

export function PlotView({ spec = '', className }: PlotProps) {
  const { t } = useLingui();
  const [state, setState] = useState<RenderState>({ status: 'loading', errorText: '' });
  // Bumped by Retry to re-run the effect after a lazy-import failure.
  const [loadAttempt, setLoadAttempt] = useState(0);
  // Revision guard: only the latest captured render may commit (React state
  // commits are asynchronous even when the build itself is synchronous).
  const revisionRef = useRef(0);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Explicit read: loadAttempt is a deliberate re-trigger signal (Retry
    // after a lazy-import failure), not data consumed by the body.
    void loadAttempt;
    const capturedRevision = ++revisionRef.current;
    let cancelled = false;

    const timer = setTimeout(() => {
      if (spec.length > MAX_PLOT_SPEC_LENGTH) {
        if (capturedRevision === revisionRef.current) {
          setState({ status: 'error', errorText: '' });
        }
        return;
      }
      void (async () => {
        // Import failures are their own recoverable state (Retry button):
        // the chunk may come back on the next attempt. The cached-rejection
        // clearing inside loadPlot makes that retry meaningful.
        let Plot: PlotModule;
        try {
          Plot = await loadPlot();
        } catch (err) {
          if (cancelled || capturedRevision !== revisionRef.current) return;
          setState({
            status: 'load-failed',
            errorText: err instanceof Error ? err.message : String(err),
          });
          return;
        }
        try {
          if (cancelled || capturedRevision !== revisionRef.current) return;
          const node = renderPlotSpec(spec, Plot);
          const host = hostRef.current;
          if (cancelled || capturedRevision !== revisionRef.current || !host) return;
          host.replaceChildren(node);
          // Plot pins explicit width/height attributes; the viewBox lets CSS
          // scale the chart down to narrow columns without upscaling blur.
          const svg = node instanceof SVGSVGElement ? node : node.querySelector('svg');
          if (svg) {
            svg.style.maxWidth = '100%';
            svg.style.height = 'auto';
            svg.removeAttribute('width');
            svg.removeAttribute('height');
          }
          if (capturedRevision !== revisionRef.current) return;
          setState({ status: 'ready', errorText: '' });
        } catch (err) {
          if (cancelled || capturedRevision !== revisionRef.current) return;
          // A failed build leaves any previous chart stale-but-visible in the
          // host; clear it so the banner + source below tell the whole story.
          hostRef.current?.replaceChildren();
          setState({
            status: 'error',
            errorText: err instanceof Error ? err.message : String(err),
          });
        }
      })();
    }, RENDER_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [spec, loadAttempt]);

  const hasFatalProblem = state.status === 'error' || state.status === 'load-failed';
  const showPreview = state.status === 'ready';

  return (
    <div
      className={cn(
        'plot flex w-full flex-col overflow-hidden rounded-md border border-border/60 bg-background',
        className,
      )}
      data-component-type-renderer="plot"
    >
      {/* Polite live region announcing state transitions for screen readers. */}
      <span role="status" aria-live="polite" className="sr-only">
        {showPreview ? (
          <Trans>Chart ready.</Trans>
        ) : hasFatalProblem ? (
          <Trans>Chart failed to render. Source is unchanged.</Trans>
        ) : (
          <Trans>Rendering chart</Trans>
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
              <Trans>Couldn&apos;t render chart.</Trans>
            </div>
            <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] opacity-90">
              {spec.length > MAX_PLOT_SPEC_LENGTH
                ? t`This plot spec is too large to render. Source is unchanged.`
                : state.errorText !== ''
                  ? state.errorText
                  : t`Could not build the chart from this plot spec.`}
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
                <Trans>The chart renderer didn&apos;t load. Source is intact.</Trans>
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

      {/* Fixed light canvas — see module comment for why charts don't track
          the dark palette in v1. The host div mounts in EVERY state (the
          build effect must find it before `ready` flips) and the canvas
          wrapper reveals only once a chart is committed; it is never
          PM-editable. */}
      <div className={cn('w-full', !showPreview && 'hidden')}>
        <div className="w-full bg-white px-3 py-2">
          <div ref={hostRef} contentEditable={false} className="plot-host w-full" />
        </div>
      </div>

      {(state.status === 'loading' || hasFatalProblem) && (
        <pre className="plot-source m-0 max-h-48 overflow-auto px-3 py-2 font-mono text-[11px] opacity-70">
          {spec}
        </pre>
      )}
    </div>
  );
}
