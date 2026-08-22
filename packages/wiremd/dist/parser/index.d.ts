import { DocumentNode, ParseOptions, ValidationError } from '../types.js';
import { DiagnosticSink } from '../diagnostics.js';

/**
 * Parse markdown with wiremd syntax into AST
 *
 * @param input - Markdown string with wiremd syntax
 * @param options - Parse options
 * @param sink - Optional diagnostics receiver (e.g. unsupported-syntax
 *   drops). Omit to keep the historical console-only behavior.
 * @returns wiremd AST (DocumentNode)
 *
 * @example
 * ```ts
 * import { parse } from 'markdown-mockup/parser';
 *
 * const ast = parse(`
 *   ## Contact Form
 *   Name
 *   [_____________________________]
 *   [Submit]{.primary}
 * `);
 * ```
 */
export declare function parse(input: string, options?: ParseOptions, sink?: DiagnosticSink): DocumentNode;
/**
 * Validate a wiremd AST
 *
 * @param ast - wiremd AST to validate
 * @returns Array of validation errors (empty if valid)
 */
export declare function validate(ast: DocumentNode): ValidationError[];
//# sourceMappingURL=index.d.ts.map