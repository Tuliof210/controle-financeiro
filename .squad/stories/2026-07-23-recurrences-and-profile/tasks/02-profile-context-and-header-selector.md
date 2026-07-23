# Profile context + header profile selector + adaptive greeting

## Description
Introduce a shared "active profile" client state and a header control to set
it. The profile is either **"familia"** (everyone) or a **Person id**. It must
be readable by the header greeting AND by the recurrences screen (task 03),
which live in different subtrees, so this introduces the project's **first
React Context provider**, mounted in `AppShell` and seeded from `localStorage`
(mirroring how `ThemeToggle` persists via `localStorage["theme"]`).

Scope of THIS task: the provider + the header `<select>` + the greeting
adaptation. The list-filtering consumer is task 03.

## When to run
- Depends on: none
- Parallel-safe with: tasks/01-recurrence-data-layer-and-api.md
- Task 03 depends on the `useProfile` hook this task exports — keep its public
  shape stable: `useProfile()` returns `{ profile, setProfile, label, people }`
  where `profile: string` (`"familia"` | personId), `label: string` (the
  resolved display name), `people: Person[]`.

## How-to

**Patterns to mirror:**
- Persistence: `src/components/AppShell/components/Header/components/ThemeToggle/hook.ts`
  + `theme.helper.ts` (localStorage + `useState` seeded in a `useEffect`,
  starting `null` to dodge hydration mismatch).
- People fetch: `.../SettingsScreen/components/PeopleSection/hook.ts`
  (`apiGet<Person[]>("/api/people")`), client `src/lib/api.ts`, entity
  `src/core/entities/person.entity.ts` (`{ id, name, color, createdAt }`).
- Native `<select>` markup: `src/components/MonthPicker/index.tsx` (the only
  `<select>` precedent — there is NO shared Select component).
- Greeting: `src/components/AppShell/components/Header/{index.tsx,hook.ts,greeting.helper.ts}`.

### 1. Provider — `src/components/ProfileProvider/`
Three files:
- `hook.ts`: create the context + a `useProfileState()` (state/logic) + the
  public `useProfile()` consumer hook. Export `ProfileProviderProps`.
  - `useProfileState()`: `const [profile, setProfileRaw] = useState<string>("familia")`;
    in a `useEffect`, read `localStorage["profile"]` and set it (guard with
    try/catch like `theme`). Fetch people via `apiGet<Person[]>("/api/people")`
    into `useState<Person[]>([])`. `setProfile(next)` writes state +
    `localStorage.setItem("profile", next)`. Derive `label`: `"Família"` when
    `profile === "familia"`, else the matching `person.name` (fallback
    `"Família"` if the id isn't found — e.g. the person was deleted).
  - `useProfile()`: `const ctx = useContext(ProfileContext); if (!ctx) throw ...; return ctx;`
- `index.tsx`: `"use client"`; renders
  `<ProfileContext.Provider value={useProfileState()}>{children}</ProfileContext.Provider>`.
- `style.module.scss`: may be empty/omitted if no markup styling — if omitted,
  don't create an empty file (keep lint happy).

Keep each file ≤100 lines (Biome caps files AND functions at 100). If
`useProfileState` approaches the function cap, extract label resolution to a
`profile.helper.ts` (+ `profile.helper.test.ts` — a pure `resolveLabel(profile,
people)` is worth one test).

### 2. Mount the provider — `src/components/AppShell/index.tsx`
Wrap BOTH `Header` and `main` so both are inside the context:
```tsx
return (
  <ProfileProvider>
    <div className={styles.shell}>
      <Header ... />
      <Aside ... />
      <main className={styles.main}>{children}</main>
    </div>
  </ProfileProvider>
);
```
`AppShell` is already `"use client"`. `layout.tsx` still just renders
`<AppShell>{children}</AppShell>` — no change there.

### 3. Header select — `src/components/AppShell/components/Header/components/ProfileSelect/`
Three-file component. A native `<select>` (copy `MonthPicker`'s `<select>`
markup/classes idiom, single select here). Options: first `<option value="familia">Família</option>`,
then one per person (`value={person.id}`, label `person.name`). Value +
`onChange` wired to `useProfile()` (`setProfile(e.target.value)`).
`aria-label="Perfil ativo"`. Style with tokens (`var(--*)`), matching the
theme-toggle's visual weight.

### 4. Slot it into the header — `src/components/AppShell/components/Header/index.tsx`
Insert `<ProfileSelect />` between `{greeting}` `<p>` and `<ThemeToggle />`.
To keep the pair grouped at the right edge, give `<ProfileSelect>` (or its
wrapper) `margin-left: auto` — currently `.greeting` has no `margin-left:auto`
and the push-right lives on the toggle. Simplest: add `margin-left:auto` to the
ProfileSelect and the toggle keeps its own; the pair sits together at the right.
Verify in the browser it doesn't wrap on mobile widths.

### 5. Adaptive greeting — `Header/hook.ts` + `greeting.helper.ts`
Keep `getGreeting(date)` pure and time-of-day only (don't break its test). In
`Header/hook.ts`, read `const { label } = useProfile();` and compose:
`setGreeting(\`${getGreeting(new Date())}, ${label}\`)`. Because `label` can
change after the initial effect (user picks a profile, or people load), include
`label` in the effect deps so the greeting updates live. Result examples:
"Boa tarde, Família", "Boa tarde, Ana".

### Verification
- `npm run lint` clean (watch the 100-line caps), `npm test` (greeting test
  still green; new `profile.helper.test.ts` if extracted), `npm run build`.
- Browser (see project verify workflow / learnings for the worktree preview
  quirk — start dev server in the worktree on a spare port, then
  `preview_start {url}`): the header shows the profile select left of the theme
  toggle; picking a person changes the greeting to "…, <name>"; reload keeps the
  choice; "Família" restores "…, Família". Confirm no console errors and no
  hydration warning (the `null`-seed pattern prevents it).
