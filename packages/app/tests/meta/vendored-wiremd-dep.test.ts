/**
 * Vendored wiremd dependency guard.
 *
 * The app consumes `wiremd` through the vendored workspace package
 * (`packages/wiremd`, a committed build — see that package's README).
 * History check: the dep was briefly `file:../../../wiremd`, which points
 * OUTSIDE this repository, so a clean standalone clone failed
 * `pnpm install --frozen-lockfile` before building anything. These checks
 * pin the two invariants that keep clean clones installable:
 *
 *   1. the dependency spec resolves INSIDE the repo (`workspace:*`);
 *   2. the vendored package actually ships every export entrypoint the app
 *      imports, with a version on record.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const APP_ROOT = join(import.meta.dirname, '..', '..', '..', '..');
const VENDOR_ROOT = join(APP_ROOT, 'packages', 'wiremd');

interface PkgJson {
  dependencies?: Record<string, string>;
  version?: string;
}

describe('vendored wiremd dependency', () => {
  test('the app depends on the vendored workspace package, not an external path', () => {
    const pkg = JSON.parse(
      readFileSync(join(APP_ROOT, 'packages', 'app', 'package.json'), 'utf-8'),
    ) as PkgJson;
    const spec = pkg.dependencies?.wiremd;
    expect(spec, 'packages/app must declare a wiremd dependency').toBeDefined();
    expect(spec).toBe('workspace:*');
  });

  test('the vendored package is present with its committed dist and metadata', () => {
    const pkgPath = join(VENDOR_ROOT, 'package.json');
    expect(existsSync(pkgPath), 'packages/wiremd/package.json exists').toBe(true);
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as PkgJson;
    expect(pkg.version, 'vendored wiremd has a version on record').toMatch(/^\d+\.\d+\.\d+/);
    // Every entrypoint the app (and its vite config) imports must ship.
    for (const entry of [
      'dist/embed.js',
      'dist/embed.cjs',
      'dist/embed/index.d.ts',
      'dist/index.js',
    ]) {
      expect(existsSync(join(VENDOR_ROOT, entry)), `packages/wiremd/${entry} is committed`).toBe(
        true,
      );
    }
  });
});
