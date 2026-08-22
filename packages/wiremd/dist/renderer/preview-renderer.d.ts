import { DocumentNode, WiremdNode } from '../types.js';
import { WiremdDiagnostic } from '../diagnostics.js';

export interface PreviewRenderContext {
    style: string;
    classPrefix: string;
    diagnostics: WiremdDiagnostic[];
    /** Per-render counter backing deterministic radio-group names. */
    radioGroupCounter: number;
}
/** Public preview payload: body-only markup + CSS for exactly one style. */
export interface PreviewResult {
    html: string;
    css: string;
    classPrefix: string;
    diagnostics: WiremdDiagnostic[];
}
export interface PreviewRenderOptions {
    style?: 'sketch' | 'clean' | 'wireframe' | 'none' | 'tailwind' | 'material' | 'brutal';
    classPrefix: string;
}
/**
 * Render a wiremd AST as an embeddable preview fragment.
 *
 * Markup and CSS are generated from ONE walk of the AST and must be injected
 * together or not at all — mixing stale CSS under fresh markup (or vice
 * versa) is the host bug this atomic contract exists to make impossible.
 *
 * Throws a documented TypeError when `classPrefix` is not a safe ASCII
 * identifier: the prefix is host-supplied (never author content), it is
 * interpolated into markup, CSS, and a RegExp, and emitting a partially
 * prefixed or markup-breaking payload is worse than refusing to render.
 */
export declare function renderPreview(documentNode: DocumentNode, options: PreviewRenderOptions): PreviewResult;
/** Render a wiremd AST node to preview-safe HTML. */
export declare function renderPreviewNode(node: WiremdNode, context: PreviewRenderContext): string;
//# sourceMappingURL=preview-renderer.d.ts.map