---
'@inkeep/open-knowledge': patch
---

Render `wiremd` fences: a ` ```wiremd ` code fence in any document now promotes to an interactive WireMD block and shows a live, script-free wireframe preview instead of raw source.

- Type wireframe syntax (`# Title`, `[Button]*`, `[____]`) inside a ` ```wiremd ` fence in source mode; the editor renders it as a preview beside the untouched source, which stays authoritative — failed compiles never rewrite your content.
- Previews run in a sandboxed frame with scripts disabled; unsupported constructs show an omissions notice rather than disappearing silently.
- Validation errors and oversized fences (>100k characters) show a recoverable error beside the source instead of a blank or partial frame.
- The renderer ships inside the app as a vendored build (`packages/wiremd`), so clean standalone clones install without any sibling checkout.
- WireMD interface strings are localized across all supported languages.
