import { DocumentNode, RenderOptions } from '../types.js';

/**
 * Render wiremd AST to HTML
 *
 * @param ast - wiremd AST (DocumentNode)
 * @param options - Render options
 * @returns HTML string
 *
 * @example
 * ```ts
 * import { parse } from 'wiremd/parser';
 * import { renderToHTML } from 'wiremd/renderer';
 *
 * const ast = parse('## Title\n[Button]*');
 * const html = renderToHTML(ast, { style: 'coss' });
 * ```
 */
export declare function renderToHTML(ast: DocumentNode, options?: RenderOptions): string;
/**
 * Render wiremd AST to JSON
 *
 * @param ast - wiremd AST (DocumentNode)
 * @param options - Render options
 * @returns JSON string
 */
export declare function renderToJSON(ast: DocumentNode, options?: RenderOptions): string;
/**
 * Render wiremd AST to React/JSX components
 *
 * @param ast - wiremd AST (DocumentNode)
 * @param options - Render options
 * @returns React component as JSX string
 *
 * @example
 * ```ts
 * import { parse } from 'wiremd/parser';
 * import { renderToReact } from 'wiremd/renderer';
 *
 * const ast = parse('## Title\n[Button]{.primary}');
 * const jsx = renderToReact(ast, { typescript: true });
 * ```
 */
export declare function renderToReact(ast: DocumentNode, options?: RenderOptions & {
    typescript?: boolean;
    componentName?: string;
}): string;
/**
 * Render wiremd AST to HTML with Tailwind CSS classes
 *
 * @param ast - wiremd AST (DocumentNode)
 * @param options - Render options
 * @returns HTML string with Tailwind classes
 *
 * @example
 * ```ts
 * import { parse } from 'wiremd/parser';
 * import { renderToTailwind } from 'wiremd/renderer';
 *
 * const ast = parse('## Title\n[Button]{.primary}');
 * const html = renderToTailwind(ast);
 * ```
 */
export declare function renderToTailwind(ast: DocumentNode, options?: RenderOptions): string;
/**
 * Render wiremd AST based on format option
 *
 * @param ast - wiremd AST (DocumentNode)
 * @param options - Render options
 * @returns Rendered output (HTML, JSON, React, or Tailwind string)
 */
export declare function render(ast: DocumentNode, options?: RenderOptions): string;
//# sourceMappingURL=index.d.ts.map