import { WiremdNode } from '../types.js';

export interface ReactRenderContext {
    classPrefix: string;
    typescript: boolean;
    useClassName: boolean;
    componentName?: string;
}
/**
 * Render a wiremd AST node to React/JSX
 */
export declare function renderNode(node: WiremdNode, context: ReactRenderContext, indent?: number): string;
//# sourceMappingURL=react-renderer.d.ts.map