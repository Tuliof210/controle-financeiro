# Project bootstrap: Next.js base, health API, Prisma+SQLite config

## Description
Stand up the very first runnable version of controle-financeiro: a scaffolded
Next.js app with no design system yet (a raw, unstyled "hello world" home
page), a minimal health-check API endpoint, and Prisma wired to local SQLite
with the datasource configured but zero models/tables. Everything later
builds on this — it's also the first real use of the component and
route/service conventions defined in .squad/ARCHITECTURE.md, and it wires up
the tooling (Biome lint gate, Vitest) that every future task's Definition of
Done depends on.

Explicitly out of scope: any design/styling system, any screens beyond the
one placeholder page, any Prisma models or migrations.

## Acceptance Criteria
- [ ] `npm run dev` boots the app locally; `/` renders an unstyled "Hello,
      world" page built via the index.tsx/hook.ts/style.module.scss
      component convention.
- [ ] `GET /api/health` responds 200 with `{ data: { status: "ok" } }`.
- [ ] `prisma/schema.prisma` exists with the SQLite datasource + generator
      configured and zero models.
- [ ] `npm run lint` (Biome, including the 100-line file/function rules) is
      all-green.
- [ ] `npm run test` (Vitest) passes, including at least the health-service
      test.
- [ ] `npm run build` succeeds.

## Definition of Done
- [ ] All acceptance criteria met.
- [ ] No design tokens, colors, spacing, or component library introduced.
- [ ] No Prisma models/tables introduced.
- [ ] Every new file follows .squad/ARCHITECTURE.md (component structure,
      route/service split, `@/` alias, 100-line cap).
- [ ] CLAUDE.md's Stack/Commands sections reflect the now-real npm scripts
      (no more "TBD — not yet scaffolded").

## Tasks
- [x] tasks/01-scaffold-nextjs-app.md — Bootstrap Next.js (Biome, no
      Tailwind/ESLint, `@/` alias) + Vitest + the unstyled hello-world home
      page.
- [ ] tasks/02-health-check-endpoint.md — Add `GET /api/health` (route +
      service + test).
- [ ] tasks/03-prisma-sqlite-config.md — Wire Prisma to local SQLite,
      datasource only, zero models.
