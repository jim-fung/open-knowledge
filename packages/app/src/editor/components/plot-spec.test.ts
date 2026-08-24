/**
 * Unit tests for the JSON plot-spec builder (`renderPlotSpec`).
 *
 * Two contracts are pinned here:
 *
 *  1. Whitelist integrity against the REAL @observablehq/plot namespace —
 *     every curated mark/transform name must still be a function upstream.
 *     This is the guard that turns an upstream rename into a loud test
 *     failure instead of a silent runtime "unknown mark".
 *
 *  2. Builder behavior against a MOCK Plot namespace (dependency-injected,
 *     so no DOM is needed): mark construction wiring, transform placement
 *     onto the mark's `transform` option, option pass-through, and the full
 *     PlotSpecError diagnostic set.
 */

import * as RealPlot from '@observablehq/plot';
import { describe, expect, test, vi } from 'vitest';
import {
  PLOT_MARK_NAMES,
  PLOT_TRANSFORM_NAMES,
  PlotSpecError,
  renderPlotSpec,
} from './plot-spec.ts';

describe('whitelist integrity vs the real @observablehq/plot', () => {
  test('every PLOT_MARK_NAMES entry is a function on the real namespace', () => {
    const missing = [...PLOT_MARK_NAMES].filter(
      (name) => typeof (RealPlot as unknown as Record<string, unknown>)[name] !== 'function',
    );
    expect(missing, 'renamed/removed upstream — update PLOT_MARK_NAMES').toEqual([]);
  });

  test('every PLOT_TRANSFORM_NAMES entry is a function on the real namespace', () => {
    const missing = [...PLOT_TRANSFORM_NAMES].filter(
      (name) => typeof (RealPlot as unknown as Record<string, unknown>)[name] !== 'function',
    );
    expect(missing, 'renamed/removed upstream — update PLOT_TRANSFORM_NAMES').toEqual([]);
  });

  test('the whitelists do not overlap', () => {
    for (const name of PLOT_MARK_NAMES) {
      expect(PLOT_TRANSFORM_NAMES.has(name), name).toBe(false);
    }
  });

  test('non-factory Plot exports are NOT whitelisted (no arbitrary namespace access)', () => {
    // `Plot.plot`, `Plot.scale`, `Plot.valueof` … must never be reachable as
    // a "mark" — the whitelist exists precisely to keep those out.
    for (const forbidden of ['plot', 'scale', 'valueof', 'legend', 'formatIsoDate']) {
      expect(PLOT_MARK_NAMES.has(forbidden), forbidden).toBe(false);
      expect(PLOT_TRANSFORM_NAMES.has(forbidden), forbidden).toBe(false);
    }
  });
});

/** Minimal mock of the Plot surface the builder touches. */
function mockPlot() {
  const calls: Array<{ factory: string; args: unknown[] }> = [];
  const markToken = (): { __mockMark: string } => ({ __mockMark: 'mark' });
  const ns = {
    plot: vi.fn((options: Record<string, unknown>) => {
      // DOM-free stand-in for the SVG/figure Plot.plot returns (these tests
      // run in the node vitest environment); options surface via a plain
      // record so assertions can inspect pass-through without a DOM.
      const dataset: Record<string, string> = {};
      for (const [k, v] of Object.entries(options ?? {})) {
        if (k === 'marks') continue;
        dataset[k] = JSON.stringify(v);
      }
      dataset.markCount = String((options?.marks as unknown[] | undefined)?.length ?? 0);
      return { tagName: 'svg', dataset };
    }),
  };
  const factory =
    (name: string) =>
    (...args: unknown[]) => {
      calls.push({ factory: name, args });
      return { ...markToken(), __factory: name };
    };
  for (const name of PLOT_MARK_NAMES) {
    (ns as unknown as Record<string, unknown>)[name] = factory(name);
  }
  for (const name of PLOT_TRANSFORM_NAMES) {
    (ns as unknown as Record<string, unknown>)[name] = factory(name);
  }
  return { ns: ns as unknown as typeof import('@observablehq/plot'), calls };
}

describe('renderPlotSpec — happy paths', () => {
  test('builds each mark through its whitelisted factory and passes top-level options through', () => {
    const { ns, calls } = mockPlot();
    const node = renderPlotSpec(
      JSON.stringify({
        marks: [
          { mark: 'barY', data: [{ x: 'a', y: 1 }], options: { x: 'x', y: 'y' } },
          { mark: 'ruleY', data: [0] },
        ],
        y: { grid: true },
        title: 'Spec title',
      }),
      ns,
    );

    expect(node.tagName).toBe('svg');
    expect(calls.map((c) => c.factory)).toEqual(['barY', 'ruleY']);
    expect(calls[0]?.args[0]).toEqual([{ x: 'a', y: 1 }]);
    expect(calls[0]?.args[1]).toEqual({ x: 'x', y: 'y' });
    // Data-only mark: options stay undefined.
    expect(calls[1]?.args[0]).toEqual([0]);
    expect(calls[1]?.args[1]).toBeUndefined();
    // Scale/axis options reach Plot.plot verbatim.
    expect(node.dataset.y).toBe(JSON.stringify({ grid: true }));
    expect(node.dataset.title).toBe('"Spec title"');
    expect(node.dataset.markCount).toBe('2');
  });

  test('a mark-level transform lands on the mark options as Plot.transform', () => {
    const { ns, calls } = mockPlot();
    renderPlotSpec(
      JSON.stringify({
        marks: [
          {
            mark: 'barY',
            data: [{ month: 'Jan', high: 7 }],
            options: { x: 'month' },
            transform: { groupX: { outputs: { y: 'mean' }, options: { x: 'month' } } },
          },
        ],
      }),
      ns,
    );

    // The transform factory ran first and its result became options.transform.
    expect(calls[0]?.factory).toBe('groupX');
    expect(calls[0]?.args[0]).toEqual({ y: 'mean' });
    expect(calls[0]?.args[1]).toEqual({ x: 'month' });
    const barCall = calls.find((c) => c.factory === 'barY');
    expect(barCall?.args[1]).toMatchObject({ x: 'month' });
    expect((barCall?.args[1] as { transform?: { __factory: string } }).transform?.__factory).toBe(
      'groupX',
    );
  });

  test('transform alone (no explicit options) still wires the transform option', () => {
    const { ns, calls } = mockPlot();
    renderPlotSpec(
      JSON.stringify({
        marks: [{ mark: 'dot', data: [1, 2], transform: { normalizeY: {} } }],
      }),
      ns,
    );
    const dot = calls.find((c) => c.factory === 'dot');
    expect(dot?.args[0]).toEqual([1, 2]);
    expect(dot?.args[1]).toEqual({ transform: { __factory: 'normalizeY', __mockMark: 'mark' } });
  });

  test('nested option objects rebuild recursively (channel specs survive)', () => {
    const { ns, calls } = mockPlot();
    renderPlotSpec(
      JSON.stringify({
        marks: [
          { mark: 'cell', data: [[0, 0]], options: { x: { type: 'band' }, fill: 'opacity' } },
        ],
      }),
      ns,
    );
    expect(calls[0]?.args[1]).toEqual({ x: { type: 'band' }, fill: 'opacity' });
  });
});

describe('renderPlotSpec — diagnostics', () => {
  test('invalid JSON names the syntax problem', () => {
    const { ns } = mockPlot();
    expect(() => renderPlotSpec('{ marks: ', ns)).toThrow(PlotSpecError);
    expect(() => renderPlotSpec('{ marks: ', ns)).toThrow(/not valid JSON/i);
  });

  test('non-object and missing-marks specs are rejected', () => {
    const { ns } = mockPlot();
    expect(() => renderPlotSpec('[1,2]', ns)).toThrow(/must be a JSON object/);
    expect(() => renderPlotSpec('{"marks": []}', ns)).toThrow(/non-empty "marks"/);
    expect(() => renderPlotSpec('{"title": "x"}', ns)).toThrow(/non-empty "marks"/);
  });

  test('unknown mark names are rejected without touching any factory', () => {
    const { ns, calls } = mockPlot();
    expect(() => renderPlotSpec(JSON.stringify({ marks: [{ mark: 'BarZ' }] }), ns)).toThrow(
      /unknown mark "BarZ"/,
    );
    expect(() => renderPlotSpec(JSON.stringify({ marks: [{}] }), ns)).toThrow(
      /must be an object with a "mark" name|unknown mark/,
    );
    expect(calls).toEqual([]);
  });

  test('shape violations carry the offending index', () => {
    const { ns } = mockPlot();
    expect(() =>
      renderPlotSpec(JSON.stringify({ marks: [{ mark: 'barY', data: 'nope' }] }), ns),
    ).toThrow(/marks\[0\]: "data" must be an array/);
    expect(() =>
      renderPlotSpec(JSON.stringify({ marks: [{ mark: 'barY', options: 'nope' }] }), ns),
    ).toThrow(/marks\[0\]: "options" must be an object/);
    expect(() =>
      renderPlotSpec(
        JSON.stringify({ marks: [{ mark: 'barY', transform: { a: {}, b: {} } }] }),
        ns,
      ),
    ).toThrow(/exactly one transform name \(got 2\)/);
    expect(() =>
      renderPlotSpec(JSON.stringify({ marks: [{ mark: 'barY', transform: { sort: {} } }] }), ns),
    ).toThrow(/unknown transform "sort"/);
  });
});
