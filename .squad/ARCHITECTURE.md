# Architecture

Single Next.js app (App Router) serving both the UI and the API (Route Handlers)
in one unit, over a local SQLite file. No backend service, no hosted DB, not
deployed — it runs on the user's own machine.

## Stack
Next 16 · React 19 · TypeScript · Prisma 7 over SQLite
(`@prisma/adapter-better-sqlite3`) · Sass Modules · visx (charts) ·
lucide-react (icons) · Zod (validation) · Biome (lint + format) · Jest
(unit tests, the project's single runner) · Storybook 10 (DS Foundations docs).

## Commands
- `npm run db:setup` — `prisma generate` + `migrate deploy`; creates the local
  tables. Idempotent; run once on a fresh checkout.
- `npm run dev` · `npm run build` · `npm run start`
- `npm run lint` — **two** gates: `biome check --error-on-warnings .` then
  `npm run lint:lines` (`scripts/check-line-cap.sh`). Both must pass. `lint:fix`,
  `format` write.
- `npm run test` — the whole Jest suite · `npm run test:coverage` — the same
  run plus the coverage table.
- `npm run typecheck` — `tsc --noEmit`.
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

**Design system** — the skin is **Monevo**: a cool neutral ramp carrying ~90% of
the interface, cobalt as the single brand hue, semantics that speak financial
state only, soft corners (6/10/14/20) over hairline borders, and three faces —
Clash Display (heros), Hanken Grotesk (body, labels, money) and IBM Plex Mono
(eyebrows, IDs, `YYYY-MM`, hex), all loaded through `next/font` in
`src/styles/fonts.ts` and applied in **both** `src/app/layout.tsx` and
`.storybook/preview.ts`. Nothing fetches a face at runtime.

Tokens are CSS custom properties, not Sass `$variables`, because they must
switch at runtime via `[data-theme="dark"]` (defaulting to
`prefers-color-scheme`). `_tokens.scss` is an aggregator of `@use` holding no
values; the values live in `_tokens-color.scss` (primitives),
`_tokens-dark.scss` (`@mixin dark-theme` — emits nothing, and is the one place
both dark selectors read, so the two can no longer drift), `_tokens-theme.scss`
(semantic aliases, light **before** dark: the Design System cards parse
first-wins), `_tokens-type.scss`, `_tokens-shape.scss` and
`_tokens-motion.scss`, plus `_theme.scss` (Sass helpers) and `_base.scss` (the
reset) → `globals.scss`. The dark selector is `:root[data-theme="dark"]`, not a
bare attribute selector, because the shape partial redeclares `--elevation-*` on
`:root` afterwards and would win at equal specificity.

Consume with `@use "theme" as t;` (the folder is on the Sass load path,
`next.config.ts`) and `var(--token)` — never hardcode a colour, space, radius,
shadow or duration; `src/app/icon.svg` is the one documented exception, since a
static asset cannot read a custom property. **The full non-negotiable ruleset is
`src/styles/README.md`.** Documented as Storybook Foundations
(`src/styles/docs/*.mdx`); the stories glob is `*.mdx`, so no DS component can
land until a story adds one.

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

**Lint severity** — `preset: "all"` enables every rule but leaves most of them at
`info`, and `biome check` exits 0 on anything below `error`: the gate was green
with 58 diagnostics on screen. Each group is therefore pinned to `"error"` in
`biome.json`, and what is noise in a test (a pt-BR literal in JSX, a `jest.mock`
factory spelling a PascalCase export, `noSecrets` on "Configurações") is turned
off in the `src/**/tests/**` override — narrowed at the rule, never at the exit
code. `--error-on-warnings` covers whatever a future Biome ships at `warn`.

**File size** — 100 lines, no exceptions: split the component, extract a
`*.helper.ts`. Enforced by `scripts/check-line-cap.sh`, counting **plain**
lines on files this branch touched under `src`, working tree included. Biome is
not that check and cannot be: `noExcessiveLinesPerFile` never reads `.scss` and
skips comment-only lines in `.ts`/`.tsx` — a 105-line file shipped under it. It
is also scoped to `**/*.{js,jsx,ts,tsx}` by a `biome.json` override, because a
270k-line `package-lock.json` is not a code smell; the shell script is the cap
that covers `.scss`. Both Biome rules stay on anyway (`maxLines: 100`, file +
function) so a bloated function can't hide under the file cap.

**Testing** — Jest is the single runner, and every test is a unit test. **Sibling
file convention**: the test for `<dir>/<name>.<ext>` is
`<dir>/tests/<name>.test.<ext>`, same base extension (`.ts` for `.ts`, `.tsx`
for `.tsx`) — one `tests/` folder per directory that holds code. `jest.config.ts`
matches exactly that (`src/**/tests/*.test.{ts,tsx}`) and builds on `next/jest`,
which supplies the SWC transform, CSS Modules, the `@/` alias and the `next/font`
mock. `jsdom` is the default environment; a `lib` or API test opts into node with
a `@jest-environment node` docblock rather than a second Jest project. Test files
sit under `src`, so the 100-line cap polices them too.

`jest.setup.ts` loads `@testing-library/jest-dom` and nothing else — deliberately:
`src/infra/db/client.ts` opens the SQLite file at import time, so anything that
instantiates Prisma in setup would put every test run on the owner's `dev.db`. A
test that reaches a `service.ts` mocks the repository.
