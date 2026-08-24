"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const fs = require("fs");
const path = require("path");
const INCLUDE_PATTERN = /!\[\[\s*([^\]]+?\.md)\s*\]\]/g;
function resolveIncludes(markdown, basePath) {
  const dir = path.dirname(path.resolve(basePath));
  const parts = markdown.split(/(```[\s\S]*?```|`[^`\n]+`)/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) return part;
    return part.replace(INCLUDE_PATTERN, (_match, relPath) => {
      const targetPath = path.resolve(dir, relPath.trim());
      if (!fs.existsSync(targetPath)) {
        return `> ⚠️ Could not include: ${relPath}`;
      }
      try {
        return fs.readFileSync(targetPath, "utf-8");
      } catch {
        return `> ⚠️ Could not include: ${relPath}`;
      }
    });
  }).join("");
}
exports.resolveIncludes = resolveIncludes;
