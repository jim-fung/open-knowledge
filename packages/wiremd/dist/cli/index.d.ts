#!/usr/bin/env node
/**
 * wiremd CLI Tool
 * Generate wireframes from markdown files
 *
 * Copyright (c) 2025 wiremd
 * Licensed under MIT License
 * https://github.com/akonan/wiremd/blob/main/LICENSE
 */
export interface CLIOptions {
    input: string;
    output?: string;
    format?: 'html' | 'json';
    style?: 'sketch' | 'clean' | 'wireframe' | 'none';
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