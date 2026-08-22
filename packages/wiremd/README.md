# Vendored wiremd

This directory is a **vendored build** of [wiremd](https://github.com/akonan/wiremd)
(MIT) — the text-first wireframe syntax whose ` ```wiremd ` fences the editor
renders. It exists so that a clean standalone clone of this repository
installs without any sibling checkout (AGENTS.md standalone-clone policy);
the upstream project is developed in its own repository and is NOT published
to npm at the version this integration needs (`wiremd/embed`).

Layout:

- `dist/` — the built ESM/CJS output + type declarations, committed to git
  (exempted from the global `dist/` ignore in `.gitignore`).
- `sync-from-upstream.mjs` — refreshes `dist/` from a local upstream checkout.

## Updating

1. In your wiremd checkout: `npm run build` (and `npm test` — keep it green).
2. In this repository: `pnpm --filter wiremd sync` (defaults to
   `../wiremd`; override with `WIREMD_CHECKOUT=/path node .../sync-from-upstream.mjs`).
3. Bump `version` in this package's `package.json` to match upstream's.
4. Commit the refreshed `dist/` together with whatever app changes need it.

Do not edit `dist/` by hand; fix upstream and sync instead. The dependency
spec in `packages/app/package.json` must stay `workspace:*` — a
`file:../../..` path would reintroduce the clean-clone install breakage
(guarded by `packages/app/tests/meta/vendored-wiremd-dep.test.ts`).
