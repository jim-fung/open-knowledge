import { WIREMD_STYLES, DocumentNode, WiremdStyle } from '../types.js';
import { WiremdDiagnostic } from '../diagnostics.js';
import { PreviewResult } from '../renderer/preview-renderer.js';

/** @deprecated use the canonical export from 'wiremd' root — kept for back-compat. */
export { WIREMD_STYLES };
export type { WiremdStyle };
export interface CompileWiremdOptions {
    /** Visual style recorded for downstream preview rendering. */
    style?: WiremdStyle;
    /** Run the AST validation stage after parsing. Default `true`. */
    validate?: boolean;
    /**
     * Expected syntax version reported by the host. A mismatch is surfaced
     * as an `error` diagnostic; compilation still proceeds best-effort so
     * the fence's source stays authoritative either way.
     */
    syntaxVersion?: string;
    /** Diagnostics sink; defaults to collecting into the result array. */
    onDiagnostic?: (diagnostic: WiremdDiagnostic) => void;
}
export interface CompileWiremdResult {
    /**
     * The parsed document. Non-null for any input string under normal
     * operation — parse is permissive and reports what it had to omit via
     * diagnostics. Reserved `null` signals an internal invariant break.
     */
    document: DocumentNode | null;
    diagnostics: WiremdDiagnostic[];
    syntaxVersion: string;
    /**
     * The validated visual style from options, carried so downstream preview
     * rendering can honor the compile call's choice without re-passing it.
     * Undefined when no style was requested (or the runtime value was not a
     * known style, which also emits a `wmd-invalid-style` error diagnostic).
     */
    style?: WiremdStyle;
}
export interface PreviewRenderOptions {
    style?: WiremdStyle;
    /** Required: prefix applied to every generated class and CSS selector. */
    classPrefix: string;
}
export type { PreviewResult };
export type { DocumentNode };
export type { SourceSpan, WiremdDiagnostic, WiremdDiagnosticSeverity, WiremdDiagnosticSource, } from '../diagnostics.js';
/**
 * Compile wiremd fence-body source into a document plus diagnostics.
 *
 * Synchronous by contract. When host-resolved includes ever arrive they
 * will ship as a separately named async entry — this signature stays
 * no-I/O forever.
 */
export declare function compileWiremd(source: string, options?: CompileWiremdOptions): CompileWiremdResult;
/**
 * Render a compiled document as a script-free, class-prefixed fragment.
 *
 * Markup and CSS are atomic: inject both into the host or neither.
 */
export declare function renderToPreview(document: DocumentNode, options: PreviewRenderOptions): PreviewResult;
//# sourceMappingURL=index.d.ts.map