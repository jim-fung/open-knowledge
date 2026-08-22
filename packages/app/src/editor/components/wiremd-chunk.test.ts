/**
 * Lazy-chunk confinement guard for the wiremd integration (glm O7).
 *
 * The wiremd LIBRARY must ship only inside its own lazy dynamic-import
 * chunk — documents without wiremd fences must never download it. The
 * thin `WiremdView` wrapper legitimately lives in a shared chunk (same
 * shape as MermaidView + the lazy mermaid lib); what this guard pins is
 * that no ENTRY chunk pulls the library implementation.
 *
 * Runs against built output (`dist/assets`) when present; skips otherwise
 * so unit-only runs don't require a build. CI builds before tests, which
 * activates it.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const assetsDir = join(dirname(fileURLToPath(import.meta.url)), '../../../dist/assets');
const hasBuild = existsSync(assetsDir);

// Property names survive minification, so the dynamic boundary
// (`moduleNamespace.compileWiremd(...)`) stays greppable in prod output.
// The view wrapper legitimately contains those property accesses in a
// shared chunk; the LIBRARY IMPLEMENTATION is identified by a string that
// only exists inside wiremd itself (the parser's drop-diagnostic message).
const LIBRARY_MARKERS = ['compileWiremd', 'renderToPreview'] as const;
const IMPLEMENTATION_FINGERPRINT = 'was omitted from the wiremd output';

function listAssets(): string[] {
  return readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
}

describe.skipIf(!hasBuild)('wiremd lazy-chunk confinement', () => {
  test('entry chunks contain no wiremd library code', () => {
    const entries = listAssets().filter((f) => /^index-.*\.js$/.test(f));
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      const source = readFileSync(join(assetsDir, entry), 'utf-8');
      for (const marker of LIBRARY_MARKERS) {
        expect(
          source.includes(marker),
          `${entry} must not contain ${marker} — the wiremd library must stay behind the lazy import`,
        ).toBe(false);
      }
      expect(
        source.includes(IMPLEMENTATION_FINGERPRINT),
        `${entry} must not contain wiremd library internals`,
      ).toBe(false);
    }
  });

  test('exactly one lazy chunk carries the wiremd library implementation', () => {
    const carriers = listAssets().filter((f) => {
      const source = readFileSync(join(assetsDir, f), 'utf-8');
      return (
        source.includes(IMPLEMENTATION_FINGERPRINT) &&
        LIBRARY_MARKERS.every((marker) => source.includes(marker))
      );
    });
    expect(carriers.length).toBe(1);
    expect(carriers[0]).toMatch(/^embed-/);
  });
});
