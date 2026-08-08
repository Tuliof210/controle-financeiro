# Architecture

Single Next.js app (App Router) serving both the UI and the API (Route Handlers)
in one unit, over a local SQLite file. No backend service, no hosted DB, not
deployed — it runs on the user's own machine.

## Stack
Next 16 · React 19 · TypeScript · Prisma 7 over SQLite
(`@prisma/adapter-better-sqlite3`) · Sass Modules · visx (charts) ·
lucide-react (icons) · Zod (validation) · Biome (lint + format) · Playwright
(e2e, the only test runner) · Storybook 10 (DS Foundations docs).

## Commands
- `npm run db:setup` — `prisma generate` + `migrate deploy`; creates the local
  tables. Idempotent; run once on a fresh checkout, plus `npx playwright
  install chromium`.
- `npm run dev` · `npm run build` · `npm run start`
- `npm run lint` — **two** gates: `biome check .` then `npm run lint:lines`
  (`scripts/check-line-cap.sh`). Both must pass. `lint:fix`, `format` write.
- `npm run test:e2e` (alias `npm run test`) — the whole suite.
- `npm run db:clean` — DELETE every row from `dev.db`.
- `npm run storybook` (:6006) · `npm run build-storybook`

## Do-not-touch
`src/generated/prisma/` (regenerated, never hand-edited, exempt from the line
cap) · `prisma/migrations/` (applied history — add one, never edit one).

## Conventions

**Language** — UI copy and route paths are pt-BR (`/movimentacoes`,
`/previsoes`, `/configuracoes`, `/leitor-ofx`; `src/lib/months.ts`). Code,
comments and docs are English. New screens follow both.

**Path alias** — `@/` → `src/`, the only one. **Naming** — component folders
PascalCase (`Button/`); other files suffixed by role
(`person.repository.ts`, `ceiling.helper.ts`).

**Components** — a folder of exactly three files: `index.tsx` (blindly calls
the folder's `hook.ts` and renders its return — no logic, state or effects),
`hook.ts` (everything else), `style.module.scss` (the suffix is mandatory —
Next scopes only `.module.scss`; a plain `.scss` leaks globally). A `_*.scss`
partial may join them when the line cap forces a split off the styles
(`RowGrid/_tiers.scss`). No barrel files — `@/components/Button` resolves via
folder→index. **Recursion**: JSX repeated twice inside a component becomes a
child in a nested `components/`, same three files, at every depth.
**Promotion**: used from outside its parent's scope, it moves to the nearest
shared `components/` (`src/components/` at the top). Next's mandated files
(`page.tsx`, `layout.tsx`, `error.tsx`, …) stay two lines that render a real
component from a sibling `components/` or route-local `_components/`.

**Design system** — tokens are CSS custom properties in `src/styles/*.scss`
(`_tokens.scss`, `_theme.scss`, `_base.scss` → `globals.scss`), not Sass
`$variables`, because they must switch at runtime via `[data-theme="dark"]`
(defaulting to `prefers-color-scheme`). Consume with `@use "theme" as t;` (the
folder is on the Sass load path, `next.config.ts`) and `var(--token)` — never
hardcode a colour, space, radius, shadow or duration. **The full
non-negotiable ruleset is `src/styles/README.md`.** Documented as Storybook
Foundations (`src/styles/docs/*.mdx`); the stories glob is `*.mdx`, so no DS
component can land until a story adds one.

**API** — `route.ts` is a thin controller (parse, call one service, map to a
response; no business logic); `service.ts` is the use case (validation, rules,
orchestration) and never imports `NextRequest`/`NextResponse`. Colocated in
`app/api/<resource>/`; a service promotes to `src/core/use-cases/` on its
second consumer. Every route returns the same envelope — `{ data }` or
`{ error: { message, code } }` (`src/lib/http.ts`) — so the frontend never
special-cases an endpoint's failure shape. Handlers are a trust boundary: the
body is parsed through a Zod schema before reaching the service.

**Layers** — `core/entities` (domain types, no framework imports),
`core/repositories` (interfaces only), `core/use-cases` (promoted services),
`infra/repositories` (implementations), `lib/` (pure helpers). `core/` never
imports `infra/` or `app/`; `route.ts`/`service.ts` wire the concrete
repository by hand — no DI framework at this scale. SRP comes from the line
cap, DIP from the interfaces, ISP from one narrow repository per entity.
Layering is not mechanically checked (Biome has no boundary rule); wiring
`noRestrictedImports` isn't worth it until `core`/`infra` are bigger.

**Persistence** — `prisma/schema.prisma`, migrations committed and applied by
`db:setup`, client generated to `src/generated/prisma`. `src/infra/db/client.ts`
holds the one `PrismaClient`, cached on `globalThis` outside production so hot
reload doesn't open a connection per edit.
`infra/repositories/<entity>.prisma.repository.ts` is the only place Prisma
types may appear; it implements the `core/repositories` interface and returns
`core/entities` types. The OFX flow (`app/api/ofx/` parses,
`app/api/ofx-imports/` records) dedupes on SHA-256 of the bytes; the import row
deliberately has no relation back to the movements it created, because there is
no undo (reason in the schema).

**File size** — 100 lines, no exceptions: split the component, extract a
`*.helper.ts`. Enforced by `scripts/check-line-cap.sh`, counting **plain**
lines on files this branch touched under `src`/`e2e`, working tree included.
Biome is not that check and cannot be: `noExcessiveLinesPerFile` never reads
`.scss` and skips comment-only lines in `.ts`/`.tsx` — a 105-line file shipped
under it. Both Biome rules stay on anyway (`maxLines: 100`, file + function) so
a bloated function can't hide under the file cap.

**Testing** — end to end, by behaviour, and nothing else: a spec drives the
real app in a real browser and asserts on the screen. Nothing is tested in
isolation — no helper, hook, service or component has its own test, and there
is no unit runner to write one with. Renaming or moving a helper must never
redden a test; if it could, the test was pinning implementation detail. Specs
in `e2e/` (Playwright). The run boots its own `next dev` on :3100, never
reusing a running one, against a throwaway `e2e.db` it deletes and re-migrates
every time — `dev.db` is never touched.
