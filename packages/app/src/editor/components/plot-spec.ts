/**
 * JSON plot-spec builder — the declarative surface of the ` ```plot ` fence.
 *
 * Observable Plot's API is programmatic (`Plot.barY(data, options)`), which
 * is exactly one shape: a whitelisted factory called with `(data, options)`.
 * That shape serializes to JSON losslessly for the declarative subset, so a
 * fence body can name marks and options without executing author code:
 *
 *   {
 *     "marks": [
 *       { "mark": "barY",
 *         "data": [{"month": "Jan", "high": 7}, …],
 *         "options": { "x": "month", "y": "high" },
 *         "transform": { "groupX": { "outputs": { "y": "mean" },
 *                                    "options": { "x": "month" } } } }
 *     ],
 *     "y": { "grid": true }
 *   }
 *
 * Everything except `marks` is passed through to `Plot.plot(options)` as-is
 * (scales, axes, margins, title, caption…). Option values are rebuilt
 * recursively but never evaluated — field-name strings, numbers, arrays and
 * nested plain objects are all Plot channels already understand. ISO date
 * strings ride Plot's native temporal coercion. Function channels and
 * computed data are out of scope by design (the `​```html preview ` fence is
 * the JS escape hatch); this keeps the invariant that built-in fences never
 * execute arbitrary code — mermaid renders with `securityLevel: 'strict'`,
 * wiremd previews in a script-less sandbox, and a plot is data + factory
 * names, nothing callable.
 *
 * The mark and transform names below are explicit allowlists curated from
 * @observablehq/plot's actual exports (0.6.x), NOT derived dynamically from
 * the namespace: `Plot[name]` with an unvalidated name would happily hand out
 * non-mark functions (`plot`, `scale`, `valueof`, …). `plot-spec.test.ts`
 * asserts every listed name is still a function on the real namespace, so an
 * upstream rename fails loudly here instead of silently at render time.
 */

import type * as PlotNamespace from '@observablehq/plot';

/** Data marks — each builds via `Plot[mark](data?, options?)`. */
export const PLOT_MARK_NAMES: ReadonlySet<string> = new Set([
  // Marks
  'area',
  'areaX',
  'areaY',
  'arrow',
  'auto',
  'barX',
  'barY',
  'boxX',
  'boxY',
  'cell',
  'cellX',
  'cellY',
  'contour',
  'crosshair',
  'crosshairX',
  'crosshairY',
  'delaunayLink',
  'delaunayMesh',
  'density',
  'differenceX',
  'differenceY',
  'dot',
  'dotX',
  'dotY',
  'frame',
  'geo',
  'graticule',
  'hexgrid',
  'image',
  'line',
  'lineX',
  'lineY',
  'link',
  'raster',
  'rect',
  'rectX',
  'rectY',
  'ruleX',
  'ruleY',
  'text',
  'textX',
  'textY',
  'tickX',
  'tickY',
  'tip',
  'tree',
  'vector',
  'vectorX',
  'vectorY',
  'voronoi',
  'voronoiMesh',
  'waffleX',
  'waffleY',
]);

/**
 * Data transforms — each builds via `Plot[name](outputs?, options?)` and
 * lands on the mark as its `transform` option. The (outputs, options) call
 * shape covers the bin / group / stack / dodge / window / bollinger /
 * normalize / map / select / shift families (each with their X/Y/Z
 * variants); transforms whose first argument is a predicate or comparator
 * function (`filter`, `sort`, `reverse`) are excluded because functions
 * aren't expressible in the declarative subset.
 */
export const PLOT_TRANSFORM_NAMES: ReadonlySet<string> = new Set([
  'bin',
  'binX',
  'binY',
  'bollinger',
  'bollingerX',
  'bollingerY',
  'dodgeX',
  'dodgeY',
  'group',
  'groupX',
  'groupY',
  'groupZ',
  'hexbin',
  'map',
  'mapX',
  'mapY',
  'normalize',
  'normalizeX',
  'normalizeY',
  'select',
  'selectFirst',
  'selectLast',
  'selectMaxX',
  'selectMaxY',
  'selectMinX',
  'selectMinY',
  'shiftX',
  'shiftY',
  'stackX',
  'stackY',
  'window',
  'windowX',
  'windowY',
]);

/** One entry of the top-level `marks` array. */
export interface PlotSpecMark {
  /** Factory name — must be in `PLOT_MARK_NAMES`. */
  mark?: unknown;
  /** Row array — objects or tuples; passed to the factory verbatim. */
  data?: unknown;
  /** Channel/scale options object; values rebuilt recursively. */
  options?: unknown;
  /**
   * Single-entry transform descriptor, e.g.
   * `{ "groupX": { "outputs": {"y": "mean"}, "options": {"x": "species"} } }`.
   * Lands on the mark as its `transform` option.
   */
  transform?: unknown;
}

/** Fatal spec problem — message is shown verbatim in the renderer banner. */
export class PlotSpecError extends Error {
  override name = 'PlotSpecError';
}

/**
 * The DOM node `Plot.plot()` returns: an `<svg>`, or a `<figure>` when the
 * spec sets `title` / `caption`.
 */
export type BuiltPlotNode = ReturnType<(typeof PlotNamespace)['plot']>;

type PlotFactory = (data?: unknown, options?: unknown) => PlotNamespace.Markish;

/**
 * Whitelist-checked access to the mark/transform factories. The allowlists
 * above are what make this cast safe — a name that isn't a curated factory
 * never reaches this lookup.
 */
function plotFactory(Plot: typeof PlotNamespace, name: string): PlotFactory {
  return (Plot as unknown as Record<string, PlotFactory>)[name];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Recursively rebuild a JSON option value for Plot. Primitives, arrays and
 * plain objects pass through structurally; nothing here can introduce a
 * function because JSON has none.
 */
function rebuildOption(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(rebuildOption);
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rebuildOption(v)]));
  }
  return value;
}

/** Validate + narrow one mark entry, with factory-name diagnostics. */
function buildMark(
  entry: unknown,
  index: number,
  Plot: typeof PlotNamespace,
): PlotNamespace.Markish {
  const where = `marks[${index}]`;
  if (!isPlainObject(entry)) {
    throw new PlotSpecError(`${where} must be an object with a "mark" name.`);
  }
  const { mark, data, options, transform } = entry;
  if (typeof mark !== 'string' || !PLOT_MARK_NAMES.has(mark)) {
    throw new PlotSpecError(
      `${where}: unknown mark ${JSON.stringify(mark ?? null)}. Use a Plot mark name such as "barY", "lineY", "dot" or "areaY".`,
    );
  }
  if (data !== undefined && !Array.isArray(data)) {
    throw new PlotSpecError(`${where}: "data" must be an array of rows.`);
  }
  if (options !== undefined && !isPlainObject(options)) {
    throw new PlotSpecError(`${where}: "options" must be an object.`);
  }

  let transformFn: PlotNamespace.Markish | undefined;
  if (transform !== undefined && transform !== null) {
    if (!isPlainObject(transform)) {
      throw new PlotSpecError(
        `${where}: "transform" must be an object like { "groupX": { "outputs": …, "options": … } }.`,
      );
    }
    const keys = Object.keys(transform);
    if (keys.length !== 1) {
      throw new PlotSpecError(
        `${where}: "transform" must have exactly one transform name (got ${keys.length}).`,
      );
    }
    const [name] = keys;
    if (!PLOT_TRANSFORM_NAMES.has(name)) {
      throw new PlotSpecError(
        `${where}: unknown transform "${name}". Use a Plot data transform such as "groupX", "binX" or "stackY".`,
      );
    }
    const shape = transform[name];
    if (!isPlainObject(shape)) {
      throw new PlotSpecError(`${where}: "${name}" must be an object with "outputs"/"options".`);
    }
    const outputs = 'outputs' in shape ? shape.outputs : undefined;
    const tOptions = 'options' in shape ? shape.options : undefined;
    if (outputs !== undefined && !isPlainObject(outputs) && !Array.isArray(outputs)) {
      throw new PlotSpecError(`${where}: "${name}.outputs" must be an object.`);
    }
    if (tOptions !== undefined && !isPlainObject(tOptions)) {
      throw new PlotSpecError(`${where}: "${name}.options" must be an object.`);
    }
    transformFn = plotFactory(Plot, name)(rebuildOption(outputs), rebuildOption(tOptions));
  }

  const markOptions =
    options === undefined && transformFn === undefined
      ? undefined
      : {
          ...(options === undefined ? {} : (rebuildOption(options) as Record<string, unknown>)),
          ...(transformFn !== undefined ? { transform: transformFn } : {}),
        };
  return plotFactory(Plot, mark)(data === undefined ? undefined : rebuildOption(data), markOptions);
}

/**
 * Parse a fence body and build the Plot DOM node (an `<svg>`, or a
 * `<figure>` when the spec sets `title`/`caption`).
 *
 * Throws `PlotSpecError` (author-facing diagnostics) or any Plot-internal
 * error unchanged — the renderer surfaces both the same way. Pure with
 * respect to the passed Plot namespace: no module state, no DOM beyond what
 * Plot itself constructs.
 */
export function renderPlotSpec(specText: string, Plot: typeof PlotNamespace): BuiltPlotNode {
  let parsed: unknown;
  try {
    parsed = JSON.parse(specText);
  } catch (err) {
    throw new PlotSpecError(
      `The plot spec is not valid JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  if (!isPlainObject(parsed)) {
    throw new PlotSpecError('The plot spec must be a JSON object with a "marks" array.');
  }
  const { marks, ...plotOptions } = parsed;
  if (!Array.isArray(marks) || marks.length === 0) {
    throw new PlotSpecError('The plot spec needs a non-empty "marks" array.');
  }
  const builtMarks = marks.map((entry, index) => buildMark(entry, index, Plot));
  return Plot.plot({
    ...(rebuildOption(plotOptions) as Partial<PlotNamespace.PlotOptions>),
    marks: builtMarks,
  });
}
