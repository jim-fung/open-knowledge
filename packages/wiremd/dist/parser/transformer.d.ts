import { Root as MdastRoot } from 'mdast';
import { DocumentNode, ParseOptions } from '../types.js';
import { DiagnosticSink } from '../diagnostics.js';

/**
 * Transform MDAST to wiremd AST
 *
 * @param sink - Optional diagnostics receiver. Unsupported-syntax drops are
 *   reported here (severity `warning`, code `wmd-unsupported-node`) instead
 *   of being silently discarded. When omitted, drops fall back to
 *   `console.warn`.
 */
export declare function transformToWiremdAST(mdast: MdastRoot, options?: ParseOptions, sink?: DiagnosticSink): DocumentNode;
//# sourceMappingURL=transformer.d.ts.map