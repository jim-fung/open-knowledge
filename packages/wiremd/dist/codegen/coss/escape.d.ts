/**
 * coss codegen layer - escaping helpers (internal)
 *
 * These helpers are NOT part of the package public surface; only emitter
 * modules under `src/codegen/coss/emitters/` import from here. Generated
 * strings must be deterministic and safe for quoted attributes and JSX
 * literals.
 *
 * Copyright (c) 2025 wiremd
 * Licensed under the MIT License
 * https://github.com/akonan/wiremd/blob/main/LICENSE
 */
/**
 * Escape text for an HTML text position: `& < > " '`.
 * `&` is replaced first so later replacements cannot corrupt entities.
 */
export declare function escapeHtmlText(text: string): string;
/**
 * Escape a value for a double-quoted HTML attribute position: `& < > " '`
 * (same set as text; kept as a separate entry point because attribute and
 * text rules are allowed to diverge).
 */
export declare function escapeHtmlAttr(value: string): string;
/**
 * Escape text for a JSX text position: `& < > { }`.
 * Braces become string-literal expressions (`{'{'}` / `{'}'}`); a single-pass
 * replace prevents the inserted braces from being re-escaped.
 */
export declare function escapeJsxText(text: string): string;
/**
 * Escape a value for a double-quoted JSX string attribute. JSX string
 * attributes undergo NO backslash escape processing (a raw `\"` is a parse
 * error in both TypeScript and esbuild), so values are entity-escaped
 * instead: `&` -> `&amp;` first (so later replacements cannot corrupt
 * entities), then `"` -> `&quot;`, `<` -> `&lt;`, `>` -> `&gt;`. Control
 * characters are left literal; backslashes are never inserted.
 */
export declare function escapeJsxAttr(value: string): string;
/**
 * Validate a URL against the allowlist and return the trimmed value.
 *
 * Permitted: empty, `#fragment`, scheme-less relative references, and
 * `http:` / `https:` / `mailto:` / `tel:` (case-insensitive scheme, after
 * trimming leading/trailing whitespace). Everything else throws
 * `Unsafe URL: <url>`.
 */
export declare function safeUrl(url: string): string;
//# sourceMappingURL=escape.d.ts.map