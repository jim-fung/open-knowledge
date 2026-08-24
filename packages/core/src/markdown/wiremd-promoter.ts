import type { Code, Root } from 'mdast';
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx';
import { visit } from 'unist-util-visit';

/**
 * The one fence-meta token the promoter understands: `style=<token>` selects
 * the wiremd visual style (validated downstream against WIREMD_STYLES by the
 * embed boundary — an unknown token here flows through and surfaces as a
 * `wmd-invalid-style` diagnostic in the preview). Any other meta (e.g.
 * `h=400`) stays v1-unspecified and deliberately ignored.
 */
const STYLE_META_PATTERN = /(?:^|\s)style=([^\s]+)/;

function buildWiremdFenceElement(
  source: string,
  meta: string | null | undefined,
  position: Code['position'],
): MdxJsxFlowElement {
  const attrs: MdxJsxAttribute[] = [{ type: 'mdxJsxAttribute', name: 'source', value: source }];
  const style = STYLE_META_PATTERN.exec(meta ?? '')?.[1];
  if (style) {
    attrs.push({ type: 'mdxJsxAttribute', name: 'style', value: style });
  }
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
 * Promotion criteria are exactly one: `lang === 'wiremd'`. A `style=<token>`
 * meta rides along as the descriptor's optional `style` prop; everything
 * else in the meta is ignored. The promoted form is in-memory only — the
 * `WiremdFence` descriptor's serializer emits a `code{lang:'wiremd'}` node
 * (re-emitting `style=…` meta when set), so on disk there is ever only an
 * ordinary fence readable by any Markdown client.
 */
export function wiremdPromoterPlugin() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      if (!parent || index === undefined || index === null) return;
      if (node.lang !== 'wiremd') return;
      const source = typeof node.value === 'string' ? node.value : '';
      const element = buildWiremdFenceElement(source, node.meta, node.position);
      (parent.children as unknown[])[index] = element;
    });
  };
}
