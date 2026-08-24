/**
 * Lazy-chunk confinement guard for the ```plot fence integration.
 *
 * Mirrors wiremd-chunk.test.ts: the @observablehq/plot LIBRARY must ship
 * only inside its own lazy dynamic-import chunk — documents without plot
 * fences must never download it. The thin `PlotView` wrapper legitimately
 * lives in a shared chunk; what this guard pins is that no ENTRY chunk
 * pulls the library implementation.
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

// The library implementation is identified by error-message strings that
// exist only inside @observablehq/plot's mark/scale internals. They survive
// minification and never appear in our allowlist tables or view wrapper.
const IMPLEMENTATION_FINGERPRINTS = [
  'ambiguous contour value',
  'channel sort requires an initializer',
  'transforms cannot be applied after initializers',
] as const;

function listAssets(): string[] {
  return readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
}

describe.skipIf(!hasBuild)('plot lazy-chunk confinement', () => {
  test('entry chunks contain no @observablehq/plot library code', () => {
    const entries = listAssets().filter((f) => /^index-.*\.js$/.test(f));
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      const source = readFileSync(join(assetsDir, entry), 'utf-8');
      for (const fingerprint of IMPLEMENTATION_FINGERPRINTS) {
        expect(
          source.includes(fingerprint),
          `${entry} must not contain "${fingerprint}" — the plot library must stay behind the lazy import`,
        ).toBe(false);
      }
    }
  });

  test('exactly one lazy chunk carries the @observablehq/plot library implementation', () => {
    const carriers = listAssets().filter((f) => {
      const source = readFileSync(join(assetsDir, f), 'utf-8');
      return IMPLEMENTATION_FINGERPRINTS.every((fingerprint) => source.includes(fingerprint));
    });
    expect(carriers.length).toBe(1);
  });
});
