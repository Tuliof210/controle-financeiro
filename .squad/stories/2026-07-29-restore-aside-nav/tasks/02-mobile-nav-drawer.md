# The rail opens as a drawer below `md`

## Outcome
- Below 768px the header hamburger opens the rail over the content; every
  destination is reachable there.
- The open drawer closes on Esc, on a click outside it, and on navigating to
  another screen.
- From 768px up nothing changes: the hamburger still collapses/expands the
  in-layout rail.
- One nav rendering, not two: no second list of destinations is introduced.

## Context
- **The technique to copy is `src/components/Modal`, not the component.** It is
  a native `<dialog>` driven by a ref effect — quoting `Modal/hook.ts`:
  ```
  // Sync the native <dialog> top-layer state with the `open` prop. showModal()
  // gives focus-trap + Esc + ::backdrop for free; native focus returns to the
  // trigger on close.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);
  ```
  plus, for outside-click and Esc, `const handleClose = () => { if (open)
  onClose(); };` and `// Backdrop click lands on the <dialog> itself (the panel
  is an inner box), so target === dialog means the click was outside` →
  `const handleClick = (e: MouseEvent<HTMLDialogElement>) => { if (e.target ===
  ref.current) onClose(); };`. Its scrim is `&::backdrop { background:
  color-mix(in srgb, var(--color-bg) 70%, transparent); }` — there is no
  overlay colour token. Modal's own box styling (centred, `max-width: 480px`)
  transfers to nothing here. Reusing `<Modal>` itself is wrong: it is a titled,
  centred dialog.
- **A `<dialog>` with no `open` attribute is `display: none` from the UA
  stylesheet, and an author `display` at the same specificity wins the tie** —
  the repo already documents that exact fact, in the pre-#49 Aside: `// The
  'display: flex' above has the same specificity as the browser's default
  '[hidden] { display: none }' UA rule, and author styles win ties`. That is
  what makes one element able to be an in-layout rail from `md` up and a
  top-layer drawer below it, if you go that way.
- **Reuse, don't re-render.** `useNavActive()` in `AppShell/nav.hook.ts` returns
  `{ items, isActive }` and is already the shared source for the rail; the
  `NavItem` component takes `{...item, active, collapsed}`. Closing on
  navigation needs no new listener — `usePathname()` is already read inside
  `useNavActive`.
- **The open/closed state lives in `AppShell/hook.ts`**, today
  `{ collapsed, toggle }` from a single `useState`, passed to both `Header`
  (`sidebarCollapsed`/`onToggleSidebar`) and `Aside` (`collapsed`/`onToggle`).
  One hamburger has to mean "collapse the rail" above `md` and "open the
  drawer" below it. If you branch on the breakpoint in JS, read it at event
  time (`window.matchMedia`) — a render-time read is a hydration seam, and 768
  then exists twice (Sass map + JS): name `$breakpoints` in a comment at the
  duplicate so the two cannot drift silently.
- **`Aside/style.module.scss` is already 150 lines**, 50 over the cap, before
  you add a drawer state. The sanctioned split is a `_*.scss` partial beside it
  (ARCHITECTURE's exception, e.g. `RowGrid/_tiers.scss`) — and a partial
  created while the dev server is running is invisible to Turbopack until you
  `touch` it (`.squad/learnings.md`).
- **Adding an e2e spec file loads every other spec harder** — `fullyParallel`
  is unset, so workers scale with file count and a geometry assertion elsewhere
  can redden without flaking (`.squad/learnings.md`). Prefer adding the drawer
  test to an existing spec over a new file; if a new file is clearly right,
  re-run the full suite twice before calling it green.
- **Preview gotchas** (`.squad/learnings.md`): `resize_window`'s "desktop"
  preset can restore a 375px pane — pass explicit width/height whenever width
  is what you are testing.

## Scope
- In: `src/components/AppShell/**` (`hook.ts`, `index.tsx`, `Aside/**`,
  `Header/**`), one e2e spec.
- Out: `src/components/Modal` (copy the technique, do not generalise it into a
  shared abstraction); `nav.ts`'s destination list; anything under `src/app/`.

## Verify
- `npm run lint`
- `npm run test`
- New/extended e2e coverage at 375px, asserting from the outside: with the
  drawer closed no nav link is reachable; after pressing the hamburger every
  destination in the nav is; Esc closes it; clicking a destination navigates
  and leaves it closed.
- `npm run dev` + preview at 375px and at 1440px: drawer opens over the content
  and the page behind it does not scroll away under it; at 1440 the hamburger
  still collapses the rail rather than opening anything.

## Forbidden
- No second list of destinations, and no third consumer of the nav definition:
  the drawer renders the same items through the same `useNavActive`.
- No hand-rolled focus trap, Esc listener or scroll-lock if the native
  `<dialog>` route gives them — and if you take another route, the drawer still
  has to trap focus and answer Esc.
- No new dependency for the drawer.
- Do not reintroduce a fixed bar of any kind at the bottom of the viewport.
