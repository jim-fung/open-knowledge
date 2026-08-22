import { WiremdNode } from '../types.js';

export interface TailwindRenderContext {
    pretty: boolean;
}
/**
 * Render a wiremd AST node to HTML with Tailwind classes
 */
export declare function renderNode(node: WiremdNode, context: TailwindRenderContext): string;
//# sourceMappingURL=tailwind-renderer.d.ts.map