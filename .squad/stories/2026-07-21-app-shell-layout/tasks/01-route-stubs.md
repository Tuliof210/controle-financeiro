# Create the four route stubs

## Description
The app needs four top-level routes, each rendering **only** an `<h1>` with its
own screen name — placeholders to be filled by later stories. Dashboard is the
home route `/`, so the existing `src/app/page.tsx` (currently renders the
"Hello world" `HomePage`) is repurposed into the Dashboard stub, and the now-
unused `HomePage` component is deleted. The other three are new route folders.

Per the owner's explicit instruction, these pages render only the `<h1>` and
nothing else — a deliberate, temporary deviation from the ARCHITECTURE.md
"thin `page.tsx` renders a real component" rule. They are stubs, not final
screens; do **not** scaffold `index/hook/style` folders for them yet.

## When to run
- Depends on: none
- Parallel-safe with: 02 at the file level (no shared files). But task 02's
  browser verification wants these routes to exist (so nav links don't 404), so
  land 01 first.

## How-to
Slugs are Portuguese **without** accents (`movimentacoes`, `recorrencias`,
`configuracoes`); the visible `<h1>` text keeps the accents.

1. Edit `src/app/page.tsx` — replace its entire contents with:
   ```tsx
   export default function Page() {
     return <h1>Dashboard</h1>;
   }
   ```
2. Create `src/app/movimentacoes/page.tsx`:
   ```tsx
   export default function Page() {
     return <h1>Movimentações</h1>;
   }
   ```
3. Create `src/app/recorrencias/page.tsx`:
   ```tsx
   export default function Page() {
     return <h1>Recorrências</h1>;
   }
   ```
4. Create `src/app/configuracoes/page.tsx`:
   ```tsx
   export default function Page() {
     return <h1>Configurações</h1>;
   }
   ```
5. Delete the now-dead HomePage component — the whole folder:
   `src/components/HomePage/` (`index.tsx`, `hook.ts`, `style.module.scss`).
   Only `src/app/page.tsx` imported it (already confirmed via
   `grep -rn HomePage src`), and step 1 removes that import — re-run the grep
   after deleting to confirm zero remaining references.

Notes:
- No styling and no component folders for these stubs — base element styles
  (`_base.scss`) already apply. `// ponytail: stub route, real screen lands later`
  is the intent; keep the diff to the literal `<h1>`.
- Deleting a whole component folder aligns with the "deletion over addition"
  convention — leave no orphan `HomePage` behind.

## Verification
- `npm run lint` — Biome check must be all-green (`biome check .`).
- `npm run build` — all four routes must compile.
- (Optional) `npm run dev`, then open `/`, `/movimentacoes`, `/recorrencias`,
  `/configuracoes` and confirm each shows just its heading.
