/**
 * Refresh packages/wiremd/dist from a local wiremd checkout's build output.
 *
 * Usage:
 *   pnpm --filter wiremd sync
 *   WIREMD_CHECKOUT=/path/to/wiremd node sync-from-upstream.mjs
 *
 * Refuses to copy a stale or incomplete build: the upstream dist must be
 * NEWER than this package's current dist (unless --force) and must contain
 * every export entrypoint the app imports.
 */

import { cpSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const defaultCheckout = resolve(here, '../../wiremd');
const checkout = process.env.WIREMD_CHECKOUT
  ? resolve(process.env.WIREMD_CHECKOUT)
  : defaultCheckout;
const force = process.argv.includes('--force');

const src = join(checkout, 'dist');
const dest = join(here, 'dist');

if (!existsSync(join(src, 'embed.js'))) {
  console.error(
    `No usable build at ${src}. Run \`npm run build\` in the wiremd checkout first ` +
      `(or set WIREMD_CHECKOUT).`,
  );
  process.exit(1);
}

for (const required of ['embed.cjs', 'index.js', 'index.d.ts']) {
  if (!existsSync(join(src, required))) {
    console.error(`Upstream dist is missing ${required}; refusing a partial copy.`);
    process.exit(1);
  }
}

if (
  !force &&
  existsSync(join(dest, 'embed.js')) &&
  statSync(join(src, 'embed.js')).mtimeMs <= statSync(join(dest, 'embed.js')).mtimeMs
) {
  console.error(
    'Upstream dist/embed.js is not newer than the vendored copy. Rebuild upstream, ' +
      'or pass --force to copy anyway.',
  );
  process.exit(1);
}

cpSync(src, dest, { recursive: true });
console.log(`Vendored wiremd dist refreshed from ${src}`);
