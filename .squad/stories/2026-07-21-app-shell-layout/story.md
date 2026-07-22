# App shell: header + collapsible aside + route stubs

## Description
The app currently boots straight into a "Hello world" page. This story gives it
a real skeleton: a persistent shell that wraps every screen. The shell has a
**header** (a time-based greeting + a button to toggle the sidebar) and an
**aside** — a collapsible navigation menu whose links point to the app's
top-level screens, rendered as `children` inside a `<main>` element.

Four screens are linked and created as placeholders (each renders only an `<h1>`
with its own name, to be filled by later stories):
- **Dashboard** — the app home, route `/` (replaces the current HomePage)
- **Movimentações** — `/movimentacoes`
- **Recorrências** — `/recorrencias`
- **Configurações** — `/configuracoes`, pinned to the bottom of the aside

Decisions taken during refinement (owner-confirmed):
- Dashboard is the root route `/`; the obsolete `HomePage` component is removed.
- Route slugs are Portuguese without accents; menu labels keep the accents.
- The aside collapses by **fully hiding/showing** (not an icon rail) via a
  toggle button in the header; when hidden, `<main>` uses the full width.
- The header greeting is **time-based** (Bom dia / Boa tarde / Boa noite) with
  **no name** — there is no user/session concept yet.

## Acceptance Criteria
- [ ] Visiting `/` shows the shell with `<h1>Dashboard</h1>` inside `<main>`.
- [ ] The aside lists four links: Dashboard, Movimentações, Recorrências
      (top group) and Configurações (pinned to the bottom).
- [ ] Each link navigates to its route; each route renders **only** its `<h1>`
      (Dashboard / Movimentações / Recorrências / Configurações) and nothing else.
- [ ] The link for the current route is visually highlighted and carries
      `aria-current="page"`.
- [ ] A header toggle button hides/shows the entire aside; `<main>` reflows to
      full width when hidden. The button reflects state via `aria-expanded`.
- [ ] The header shows a time-based greeting: `Bom dia` before 12h, `Boa tarde`
      before 18h, `Boa noite` otherwise — with no name.
- [ ] Shell renders correctly in both light and dark themes using tokens only —
      no hardcoded color / spacing / radius / shadow / duration values.
- [ ] The toggle button and every nav link have a visible focus ring.

## Definition of Done
- [ ] Story + task files saved (this command).
- [ ] `npm run lint` is green.
- [ ] `npm run test` is green (greeting helper test included).
- [ ] `npm run build` succeeds.
- [ ] Verified in the browser: toggle hides/shows the aside, all four links
      navigate and render their `<h1>`, active link is highlighted, greeting
      shows, both light and dark themes look right.
- [ ] The unused `src/components/HomePage/` folder is deleted.

## Tasks
- [ ] tasks/01-route-stubs.md — Create the four route pages (Dashboard at `/`,
      plus `/movimentacoes`, `/recorrencias`, `/configuracoes`), each rendering
      only its `<h1>`; remove the obsolete HomePage.
- [ ] tasks/02-app-shell.md — Build `AppShell` (header + collapsible aside +
      main) with a time-based greeting helper + test, and wire it into the root
      layout.
