import { WiremdNode } from '../types.js';

export interface RenderContext {
    style: string;
    classPrefix: string;
    inlineStyles: boolean;
    pretty: boolean;
}
/**
 * Render a wiremd AST node to HTML
 */
export declare function renderNode(node: WiremdNode, context: RenderContext): string;
//# sourceMappingURL=html-renderer.d.ts.map