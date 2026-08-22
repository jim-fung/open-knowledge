import { createServer } from 'http';

interface ServerOptions {
    port: number;
    outputPath?: string;
    renderFile?: (mdPath: string) => string;
    /** Root directory for resolving linked .md files. Defaults to dirname(outputPath). */
    rootDir?: string;
    /** Entry .md filename (e.g. "index.md"). When set, GET / redirects to /{inputFile}. */
    inputFile?: string;
}
export declare function startServer(options: ServerOptions): ReturnType<typeof createServer>;
export declare function notifyReload(): void;
export declare function notifyError(errorMessage: string): void;
export {};
//# sourceMappingURL=server.d.ts.map