import { WiremdStyle } from '../types.js';

export declare function warnIfDeprecatedStyle(style: string, log: {
    style(msg: string): void;
}): void;
export interface CLIOptions {
    input: string;
    output?: string;
    format?: 'html' | 'json';
    style?: WiremdStyle;
    codegen?: 'html' | 'jsx';
    watch?: boolean;
    serve?: number;
    pretty?: boolean;
    watchPattern?: string;
    ignorePattern?: string;
}
export declare function showHelp(): void;
export declare function showVersion(): void;
export declare function parseArgs(args: string[]): CLIOptions | null;
/**
 * Check if file is too large and might cause performance issues
 */
export declare function checkFileSize(filePath: string): void;
export declare function generateOutput(options: CLIOptions): string;
export declare function main(): void;
//# sourceMappingURL=index.d.ts.map