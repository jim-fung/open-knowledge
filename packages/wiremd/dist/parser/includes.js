import { existsSync, readFileSync } from "fs";
import { dirname, resolve } from "path";
const INCLUDE_PATTERN = /!\[\[\s*([^\]]+?\.md)\s*\]\]/g;
function resolveIncludes(markdown, basePath) {
  const dir = dirname(resolve(basePath));
  const parts = markdown.split(/(```[\s\S]*?```|`[^`\n]+`)/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) return part;
    return part.replace(INCLUDE_PATTERN, (_match, relPath) => {
      const targetPath = resolve(dir, relPath.trim());
      if (!existsSync(targetPath)) {
        return `> ⚠️ Could not include: ${relPath}`;
      }
      try {
        return readFileSync(targetPath, "utf-8");
      } catch {
        return `> ⚠️ Could not include: ${relPath}`;
      }
    });
  }).join("");
}
export {
  resolveIncludes
};
