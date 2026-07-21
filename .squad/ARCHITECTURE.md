# Architecture

Single Next.js application (App Router) providing both the UI and the API
(via Route Handlers) in one deployable unit, backed by a local SQLite
database file — no separate backend service, no hosted DB. Runs on the
user's own machine.

## Conventions

### Path alias
`@/` → `src/`. One alias only — no `@components`, `@utils`, etc.

### Naming
Component folders: PascalCase, matching the component name (`Button/`,
`MonthlySummaryCard/`). Non-component files: suffixed by role
(`entry.repository.ts`, `calculate-delta.helper.ts`).

### Frontend — component structure
Every component is a folder with exactly three files:
- `index.tsx` — blindly instantiates the folder's `hook.ts` (passing props
  through) and renders JSX from whatever it returns. No logic, no state, no
  effects.
- `hook.ts` — everything else: props handling, state, effects, handlers,
  derived consts, business logic.
- `style.module.scss` — Sass Module. `.module.scss` suffix is mandatory —
  Next.js only scopes styles for files named that way; plain `style.scss`
  would leak globally. Requires the `sass` package as a dependency.

Because the component is `index.tsx`, `@/components/Button` resolves on its
own (default folder→index resolution) — no barrel files anywhere.

**Recursion**: any internal JSX structure repeated more than once inside a
component becomes a child component in a `components/` folder inside the
parent, same three-file structure. Applies at every depth.

**Promotion**: the moment a component is used from outside its current
parent's scope, it moves up to the nearest shared `components/` folder
(`src/components/` at the top). Every future importer then follows the same
predictable path.

**Next.js special files** (`page.tsx`, `layout.tsx`, `loading.tsx`,
`error.tsx`, `not-found.tsx`) are framework-mandated names — they can't
become `index.tsx`. Keep them to a couple of lines that just render a real
component living in a sibling `components/` (or route-local `_components/`)
folder, which does follow the standard structure.

### Backend — Route Handler structure
Same split, mirrored:
- `route.ts` (Next.js-mandated name) — thin controller: parse the request,
  call one service function, map the result/error to an HTTP response. No
  business logic.
- `service.ts` — the use case: validation, business rules, orchestration.
  Framework-agnostic — never imports `NextRequest`/`NextResponse`.

Colocate `route.ts` + `service.ts` in the same `app/api/<resource>/` folder.
**Same promotion rule as the frontend**: a service stays colocated until a
second consumer (another route, a script, a cron) needs it — then it
promotes to `src/core/use-cases/`.

### Domain layer (Clean Architecture)
```
src/
  app/
    api/<resource>/route.ts, service.ts   # thin controller + colocated use case
    <routes>/page.tsx                     # thin, renders a real component
  components/                             # shared/common components (promoted)
  core/
    entities/                             # domain types — no framework/SQLite imports
    repositories/                         # repository interfaces only
    use-cases/                            # promoted services (used by >1 caller)
  infra/
    repositories/                         # SQLite implementations of core/repositories
  lib/                                    # small, pure, framework-agnostic helpers
```
Dependency rule: `core/` never imports `infra/` or `app/`. `infra/`
implements the interfaces `core/` declares. `route.ts`/`service.ts` wire the
concrete repository in by hand (plain constructor/function injection — no DI
framework needed at this scale).

### File size
Max 100 lines, no exceptions — split into more components, extract a helper,
or pull hook logic into a `*.helper.ts`. Enforced by Biome's
`noExcessiveLinesPerFile` (nursery rule, not on by default — enable in
`biome.json` with `maxLines: 100`). Paired with `noExcessiveLinesPerFunction`
so one bloated function can't hide under the file cap. A task/PR isn't
review-ready until `biome check` is all-green — front and back alike.

### SOLID / Clean Architecture, operationalized
- SRP: the 100-line cap forces it mechanically on both `hook.ts` and
  `service.ts`.
- DIP: services/use-cases depend on a `core/repositories` interface, never on
  the SQLite driver directly — swapping storage later means a new `infra/`
  implementation, zero changes to `core/` or `app/`.
- ISP: one narrow repository interface per entity, not one god-repository.
- Layering itself isn't mechanically checked yet — Biome has no Nx-style
  boundary rule. `noRestrictedImports` + per-folder `overrides` can
  approximate it once `core/infra` actually have enough files to police; not
  worth wiring before then.

### Consistent API shape
Every route returns the same success/error envelope (e.g. `{ data }` /
`{ error: { message, code } }`), so the frontend never special-cases a given
endpoint's failure shape.

### Testing
Vitest. Every non-trivial `hook.ts` / `service.ts` (a branch, a loop, or
anything touching the expected-vs-actual delta math) gets one colocated
`*.test.ts` file.

### Request validation
Zod. Route handlers are a trust boundary — the request body is parsed
through a Zod schema before it reaches the service.
