---
'@inkeep/open-knowledge': patch
---

Render data charts with a new ` ```plot ` fenced code block. The fence body is a JSON plot spec — inline your data rows, name an Observable Plot mark (`barY`, `lineY`, `dot`, `areaY`, …), and the chart renders as crisp SVG right in the doc; no JS, no iframes. Insert via the slash menu ("Plot") or write the fence directly; spec errors render as diagnostics beside the source, which stays authoritative and readable in any Markdown client.

The library ships only behind the editor's lazy dynamic import (pinned by a chunk-confinement guard); the combined-chunk size budget grows 6.55 → 6.75 MB gzipped to admit it.
