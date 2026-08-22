import { Location } from './types.js';

/**
 * A located span within the compiled source string.
 *
 * Fence-relative: line 1 / column 1 / offset 0 is the first character of
 * the source passed to the compiler. Line and column are 1-based (unist
 * convention); offset is a 0-based character offset.
 */
export interface SourceSpan {
    line: number;
    column: number;
    offset?: number;
}
export type WiremdDiagnosticSeverity = 'error' | 'warning' | 'info';
export type WiremdDiagnosticSource = 'parser' | 'validator' | 'renderer' | 'include';
export interface WiremdDiagnostic {
    severity: WiremdDiagnosticSeverity;
    /** Stable, documented identifier, e.g. `'wmd-unsupported-node'`. */
    code: string;
    message: string;
    source: WiremdDiagnosticSource;
    /** Present whenever the diagnostic can be located; omitted otherwise. */
    start?: SourceSpan;
    end?: SourceSpan;
}
/**
 * Sink for diagnostics produced while parsing/transforming. Hosts pass a
 * collector via `compileWiremd`'s `onDiagnostic`; the plain `parse()` path
 * keeps its historical console behavior.
 */
export type DiagnosticSink = (diagnostic: WiremdDiagnostic) => void;
/** Convert an mdast `position` into fence-relative start/end spans. */
export declare function spansFromPosition(position: Location | undefined | null): {
    start?: SourceSpan;
    end?: SourceSpan;
};
//# sourceMappingURL=diagnostics.d.ts.map