# Scaffold the Next.js app base

## Description
Bootstrap the Next.js project at the repo root with `create-next-app`, wired
to this repo's already-decided conventions from .squad/ARCHITECTURE.md and
CLAUDE.md: Biome instead of ESLint, no Tailwind (styling isn't scoped yet),
`@/` import alias, App Router, `src/` directory, TypeScript. Then add Vitest,
and build a single unstyled "hello world" home page using the mandatory
component convention (`index.tsx` + `hook.ts` + `style.module.scss`) so the
pattern is proven from the very first file. This is the foundation every
other task in this story (and every future story) builds on.

## When to run
- Depends on: none
- Parallel-safe with: none — must land first, everything else needs the
  scaffolded `package.json` / app structure to exist.

## How-to

1. From the repo root, run:
   ```
   npx create-next-app@latest . --typescript --app --biome --no-tailwind \
     --no-eslint --no-agents-md --src-dir --import-alias "@/*" --empty --use-npm
   ```
   - `--biome` scaffolds `biome.json` directly — no separate `biome init`
     needed, and it keeps ESLint out entirely (this repo's lint tool is
     Biome only, per .squad/ARCHITECTURE.md).
   - `--empty` skips Next.js's default marketing/demo homepage.
   - `--no-agents-md` skips Next.js's generic auto-generated agent-guidance
     file — this repo already has CLAUDE.md / .squad/PRODUCT.md /
     .squad/ARCHITECTURE.md for that purpose; a second, generic one would
     just be duplicate/conflicting instructions.
   - Do **not** pass `--disable-git`: this repo has no git history yet: if
     it's not already a git repo, letting `create-next-app` run `git init`
     here is a convenient, harmless side effect. Confirm after with
     `git status`.
   - **Risk**: the repo root already has `.claude/`, `.squad/`, `CLAUDE.md`
     (and possibly `.git/`) in it. `create-next-app` may refuse to scaffold
     into a directory it considers non-empty. If it does: scaffold into a
     throwaway sibling directory with the same flags
     (`npx create-next-app@latest ../cf-scaffold-tmp ...`), then move the
     generated files into the repo root, without overwriting `.claude/`,
     `.squad/`, or `CLAUDE.md`, and delete the temp directory.
2. Check `src/app/globals.css` — with `--no-tailwind --empty` it should
   already be minimal; strip anything beyond a barebones reset if
   `create-next-app` left demo styling in it. No design tokens here (out of
   story scope).
3. In `package.json`, confirm `dev` / `build` / `start` scripts exist (they
   do by default) and add:
   ```json
   "lint": "biome check .",
   "lint:fix": "biome check --write ."
   ```
4. Open the generated `biome.json` and enable the file-size rules:
   ```json
   {
     "linter": {
       "rules": {
         "style": {
           "noExcessiveLinesPerFile": { "level": "on", "options": { "maxLines": 100 } },
           "noExcessiveLinesPerFunction": { "level": "on", "options": { "maxLines": 100 } }
         }
       }
     }
   }
   ```
   Verified against Biome's current docs at authoring time (`style` group).
   If `npm run lint` reports an unknown rule path against the installed
   version, run `npx biome explain noExcessiveLinesPerFile` to see its
   current group and fix the JSON path — Biome has moved rules between
   `nursery` and `style` across releases.
5. Install Vitest: `npm install -D vitest`. Add to `package.json` scripts:
   `"test": "vitest run"`. Create `vitest.config.ts` at the repo root:
   ```ts
   import path from 'node:path'
   import { defineConfig } from 'vitest/config'

   export default defineConfig({
     resolve: { alias: { '@': path.resolve(__dirname, './src') } },
   })
   ```
   No `jsdom` / `@testing-library/react` yet — nothing renders a component
   in a test until a future task actually needs that; add it then, not now.
6. Build the home page per .squad/ARCHITECTURE.md's component convention:
   - `src/app/page.tsx` (Next.js-mandated filename, kept to a couple of
     lines): renders `<HomePage />` imported from `@/components/HomePage`.
   - `src/app/layout.tsx` (Next.js-mandated root layout): minimal
     `<html><body>{children}</body></html>`, importing `./globals.css`. No
     design.
   - `src/components/HomePage/index.tsx` — instantiates `useHomePage()` from
     `./hook`, renders the returned `message` in a plain element, imports
     `./style.module.scss`.
   - `src/components/HomePage/hook.ts` — `useHomePage()` returning
     `{ message: 'Hello, world' }`.
   - `src/components/HomePage/style.module.scss` — near-empty module (just
     enough that the `.module.scss` import resolves); no colors/spacing/
     tokens — that's a future, separate design story.
7. Update CLAUDE.md: remove the "not yet scaffolded" caveat from Stack, and
   fill in the Commands section with the real scripts (`npm run dev`,
   `npm run build`, `npm run lint`, `npm run test`).

## Verification
- `npm run build` succeeds.
- `npm run lint` is all-green.
- `npm run test` passes (no tests yet at this point in the story — an empty
  Vitest run should still exit 0; if it doesn't, task 02 will be the first
  real test).
- `npm run dev`, then load `http://localhost:3000` — the hello-world message
  renders, no console errors.
