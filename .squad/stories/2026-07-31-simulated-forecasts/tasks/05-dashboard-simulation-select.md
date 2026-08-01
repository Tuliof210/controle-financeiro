# The dashboard's simulation selector

## Outcome
- A native select sits above the hero band on `/`, offering "Apenas dados
  reais" and "Incluir simulações", and a fresh browser starts on the first.
- Changing it re-fetches the board and every figure moves.
- The choice is written to `localStorage` and restored on reload.

## Context

**The client half of `cap` is the template** — same shape, same file.
`src/app/_components/DashboardScreen/hook.ts` (84 lines):

```ts
  const [cap, setCap] = useState<CeilingCap>(DEFAULT_CEILING_CAP);
  useEffect(() => {
    let current = true;
    setPending(true); setError(undefined);
    apiGet<DashboardData>(
      `/api/dashboard?owner=${encodeURIComponent(profile)}&cap=${cap}`,
    ).then((result) => {
      // A response for a profile or cap we have already moved on from must not land.
      if (!current) return;
      setPending(false);
      if (result.error || !result.data) return setError(result.error ?? "Erro inesperado");
      setHeld({ owner: profile, payload: result.data });
    });
    return () => { current = false; };
  }, [profile, cap]);
```

The new state joins the dep array and the query string the same way. `held` is
tagged only by `owner`, so a simulation change behaves like a cap change: the
board stays mounted and dims via `refreshing`. That is the wanted behaviour —
do not extend the tag.

**Persistence differs from `cap` on purpose.** `cap` is deliberately not
persisted (owner's decision, 2026-07-30, recorded in that hook's comment); this
one is (owner's decision, 2026-07-31). Copy `ProfileProvider/hook.ts`'s
SSR-safe shape instead — read in an effect so the first render is the default,
write on set, both in a bare `try/catch`:

```ts
  useEffect(() => {
    try { const stored = localStorage.getItem("profile"); if (stored) setProfileRaw(stored); } catch {}
  }, []);
  const setProfile = useCallback((next: string) => {
    setProfileRaw(next);
    try { localStorage.setItem("profile", next); } catch {}
  }, []);
```

A stored value outside `SIMULATION_VIEWS` (task 04's `src/lib/simulation.ts`)
must fall back to `DEFAULT_SIMULATION_VIEW` rather than reach the URL.

**Reuse `src/styles/_select.scss`** — the skin every select in the app wears,
already on the Sass load path: `appearance: none`, `min-height: 46px` (its
comment notes this clears the 44px floor and leaves room for the caret), the
two-gradient caret, `@include t.focus-ring` on `:focus-visible`. It sets
`width: 100%`, which is right in a form and wrong outside one;
`ProfileSelect/style.module.scss` records the fix and the reason — a `<select>`
is sized by its widest option, so an unbounded one pushes a 375px layout past
the viewport:

```scss
  flex: 0 1 auto;
  width: auto;
  min-width: 0;
```

`src/components/SelectField` wraps the same skin with a visible `<label>`.

**Where it renders:** `DashboardScreen/index.tsx` (65 lines), as a sibling
directly above `<HeroBand />` inside `.screen` — which is
`display: flex; flex-direction: column; gap: var(--space-6)`. It must render
regardless of `data.status`: reaching a range may be exactly why the reader
turns simulations on, and `no_range` / `out_of_range` are reachable states here
(see task 04). There is no `PageHeader` on this route, so give the select an
`aria-label` if you do not render a visible one.

**Watch out for the line cap.** `DashboardScreen/hook.ts` is 84 lines against a
hard 100 (`npm run lint:lines` fails on any file this branch touches). State +
localStorage read + localStorage write + the query string will not fit — plan on
a sibling `simulation.hook.ts`. The folder already has `show-all.hook.ts`, whose
header explains the role-suffixed naming: *"a folder's hook.ts is called by its
OWN index.tsx, and this one is called by another component's hook."*

**Watch out for `HINTS`** in `DashboardScreen/hints.ts` — several strings say
"previstas"/"previsto". They stay true in both views. Leave them.

## Scope
- In: `src/app/_components/DashboardScreen/{hook.ts,index.tsx}`, a new selector
  component folder under `.../DashboardScreen/components/`, and a
  `simulation.hook.ts` sibling if the cap forces the split.
- Out: `src/components/AppShell/**` — the selector does **not** go in the
  global header next to Perfil (owner's decision, 2026-07-31: it would show on
  every route while affecting only this one, and the header row is already at
  its min-content limit at 375px). Out: everything under `src/app/api/**`.

## Verify
```
npm run lint
npm run build
```
In the browser with `npm run dev` and at least one simulated forecast saved:
switch to "Incluir simulações" and confirm the hero band figure and the Teto de
Gastos both move; reload and confirm the selection survived; open a private
window and confirm it starts on "Apenas dados reais". Confirm the network tab
shows one request per change, carrying `simulation=`.

Measure rather than assume: at a 375px viewport, read
`document.documentElement.scrollWidth - document.documentElement.clientWidth`
and confirm it is ≤ 0 with the longest option selected.

## Forbidden
- No second fetch and no client-side subtraction — the flag goes to the API and
  the API answers with one payload.
- Do not persist `cap` while you are in there.
- No hardcoded colour, spacing or radius; the select must wear `select.skin`
  rather than a new set of borders.
