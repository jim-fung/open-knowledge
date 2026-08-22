import type { Code, Root } from 'mdast';
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx';
import { visit } from 'unist-util-visit';

function buildWiremdFenceElement(source: string, position: Code['position']): MdxJsxFlowElement {
  const attrs: MdxJsxAttribute[] = [{ type: 'mdxJsxAttribute', name: 'source', value: source }];
  const element: MdxJsxFlowElement = {
    type: 'mdxJsxFlowElement',
    name: 'WiremdFence',
    attributes: attrs,
    children: [],
  };
  if (position) {
    element.position = position;
  }
  return element;
}

/**
 * Promote ` ```wiremd ` fenced code blocks to built-in `WiremdFence` JSX
 * elements, exactly mirroring the Mermaid precedent (`mermaid-promoter.ts`).
 *
 * Promotion criteria are exactly one: `lang === 'wiremd'`. Fence meta (e.g.
 * ` ```wiremd h=400 `) is v1-unspecified and deliberately ignored. The
 * promoted form is in-memory only — the `WiremdFence` descriptor's
 * serializer emits a `code{lang:'wiremd'}` node, so on disk there is ever
 * only an ordinary fence readable by any Markdown client.
 */
export function wiremdPromoterPlugin() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      if (!parent || index === undefined || index === null) return;
      if (node.lang !== 'wiremd') return;
      const source = typeof node.value === 'string' ? node.value : '';
      const element = buildWiremdFenceElement(source, node.position);
      (parent.children as unknown[])[index] = element;
    });
  };
}
