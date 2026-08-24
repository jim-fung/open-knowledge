import type { Code, Root } from 'mdast';
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx';
import { visit } from 'unist-util-visit';

function buildPlotFenceElement(spec: string, position: Code['position']): MdxJsxFlowElement {
  const attrs: MdxJsxAttribute[] = [{ type: 'mdxJsxAttribute', name: 'spec', value: spec }];
  const element: MdxJsxFlowElement = {
    type: 'mdxJsxFlowElement',
    name: 'PlotFence',
    attributes: attrs,
    children: [],
  };
  if (position) {
    element.position = position;
  }
  return element;
}

/**
 * Promote ` ```plot ` fenced code blocks to built-in `PlotFence` JSX
 * elements, exactly mirroring the Mermaid precedent (`mermaid-promoter.ts`)
 * and the Wiremd precedent (`wiremd-promoter.ts`).
 *
 * Promotion criteria are exactly one: `lang === 'plot'`. The fence body is a
 * JSON plot spec (see the app-side `PlotView`) but the parse side performs NO
 * validation — the fence source is authoritative, and render-time diagnostics
 * belong to the renderer, not the parse pipeline. Fence meta (e.g.
 * ` ```plot h=400 `) is v1-unspecified and deliberately ignored. The promoted
 * form is in-memory only — the `PlotFence` descriptor's serializer emits a
 * `code{lang:'plot'}` node, so on disk there is ever only an ordinary fence
 * readable by any Markdown client.
 */
export function plotPromoterPlugin() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      if (!parent || index === undefined || index === null) return;
      if (node.lang !== 'plot') return;
      const spec = typeof node.value === 'string' ? node.value : '';
      const element = buildPlotFenceElement(spec, node.position);
      (parent.children as unknown[])[index] = element;
    });
  };
}
