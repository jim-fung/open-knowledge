/**
 * wiremd file-include resolution (Node-only)
 *
 * Expands `![[file.md]]` directives by reading sibling files from disk.
 * Lives in its own module so the browser-safe parser entry doesn't
 * pull `fs` / `path` for consumers that don't use includes.
 */
export declare function resolveIncludes(markdown: string, basePath: string): string;
//# sourceMappingURL=includes.d.ts.map