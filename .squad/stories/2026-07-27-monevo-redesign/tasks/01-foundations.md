# Foundations — amend rule 3, add the hard-shadow and `--rail-*` tokens

## Description
Every other task in this story consumes two things that do not exist yet: a
tokenised hard offset shadow, and a colour family for the dark navigation rail.
This task adds both, amends the constitution that currently forbids the first,
and updates the test and the Storybook Foundations docs so nothing goes stale.

**Why the amendment is honest.** `src/styles/README.md` rule 3 reads
"Elevation is border-first… **No hard offset shadows anywhere.**" The design
this story implements puts `box-shadow: 3px 3px 0 var(--c-border)` on every
primary button and `8px 8px 0` on the modal panel — it is the single most
recognisable thing about the look. The owner decided (during refinement) to
amend the rule and tokenise the shadow rather than hardcode past the rule or
drop the design's signature. Blur-based `--elevation-overlay` keeps its
existing job (floating layers only); the new tokens get a narrow, written-down
scope.

This task ships **no visual change on its own** — nothing consumes the new
tokens yet. That is fine and expected; it is the smallest reviewable unit and
it unblocks everything else.

## When to run
- Depends on: none — this is the first task of the story.
- Parallel-safe with: none. Tasks 02 and 03 both consume these tokens.

## How-to

### Files
```
src/styles/_tokens.scss          (edit)
src/styles/_theme.scss           (edit — the elevation mixin)
src/styles/tokens.test.ts        (edit)
src/styles/README.md             (edit — rule 3)
src/styles/docs/Elevation.mdx    (edit)
src/styles/docs/Colors.mdx       (edit)
```

### 1. `_tokens.scss` — the hard-shadow tokens
Add to the existing elevation `:root` block (the one that already declares
`--elevation-flat`, `--elevation-raised`, `--elevation-overlay`):

```scss
  // Hard offset shadows: the frame, cast. Deliberately blur-less, and always
  // in --color-border so they flip with the theme like the border they echo.
  // Scope is written down in README rule 3: primary action + modal panel only.
  --elevation-press: 3px 3px 0 var(--color-border);
  --elevation-press-active: 1px 1px 0 var(--color-border);
  --elevation-panel: 8px 8px 0 var(--color-border);
```

Three tokens, one `:root` declaration each — **no dark counterpart needed**,
because `--color-border` is already themed (`--ink-900` light, `--ink-600`
dark). Do not duplicate them into the dark blocks; that would be dead CSS.

### 2. `_tokens.scss` — the `--rail-*` family
The rail is dark in **both** themes, so these are genuinely new semantics, not
aliases of existing ones. Declare all five in **three** places:

`:root` (light):
```scss
  --rail-bg: var(--ink-900);
  --rail-fg: var(--paper);
  --rail-muted: var(--ink-500);
  --rail-line: var(--ink-700);
  --rail-hover: var(--ink-800);
```

`[data-theme="dark"]` **and** `:root:not([data-theme="light"])` inside the
`@media (prefers-color-scheme: dark)` block — identical values in both:
```scss
  --rail-bg: var(--ink-800);
  --rail-fg: var(--ink-050);
  --rail-muted: var(--ink-400);
  --rail-line: var(--ink-700);
  --rail-hover: var(--ink-700);
```

**Both dark blocks, not one.** `--elevation-overlay` is the precedent — it is
declared twice for exactly this reason. `tokens.test.ts` concatenates the two
buckets, so satisfying only one still passes the test while silently breaking
dark mode for anyone who never touched the toggle. Copy `--elevation-overlay`'s
placement.

**Contrast, measured not assumed.** `--rail-muted` on `--rail-bg` is the pair
that decides whether the `MENU` label and the collapse button are legible.
Check both themes against README rule 7(b) (4.5:1 body / 3:1 large) with a real
contrast tool before you finish, and put the two numbers in the PR body. If
light fails, `--ink-400` is the next step up — do not "fix" it by lightening
the text of one component.

### 3. `_theme.scss` — extend the elevation mixin
The mixin is an explicit `@if / @else if` chain ending in
`@error "Unknown elevation level: #{$level}."`, so `@include t.elevation(press)`
**fails the Sass compile** until you extend it. Add the three levels alongside
`flat | raised | overlay`, keeping the existing shape:

```scss
  @else if $level == press {
    box-shadow: var(--elevation-press);
  } @else if $level == press-active {
    box-shadow: var(--elevation-press-active);
  } @else if $level == panel {
    box-shadow: var(--elevation-panel);
  }
```

### 4. `tokens.test.ts` — require the rail family in both themes
The test is a hardcoded allow-list, not an enumeration: it will keep passing
untouched if you add tokens and say nothing. README rule 6 ("every semantic
token exists in both themes") is only enforced for names that appear in
`REQUIRED_SEMANTIC_COLORS`. Append the five:

```ts
  "rail-bg",
  "rail-fg",
  "rail-muted",
  "rail-line",
  "rail-hover",
```

Then **prove the test bites**: delete one of the dark declarations, run
`npx vitest run src/styles`, confirm it fails, put it back. A test that cannot
fail is not verification — `.squad/learnings.md` records this exact lapse
costing two review rounds on an earlier PR.

Two live traps in that file's regexes, both easy to hit here:
- The capture is `:root\s*\{([^}]*)\}` — **any nested block inside `:root`
  truncates the match at the first `}`**, making every token declared after it
  invisible. Do not nest anything inside `:root`.
- Tokens declared under any other selector (`html`, a data attribute) are in
  neither bucket. Keep the rail family in the three blocks named above.

Elevation is **not** tested at all, by design. Do not add elevation names to
`REQUIRED_SEMANTIC_COLORS` — the regex looks in the colour blocks and would
fail for the wrong reason.

### 5. `README.md` — rule 3, amended in place
Rewrite rule 3 so it stays a rule rather than becoming a loophole. It must say,
in the file's existing voice:
- Elevation is still border-first: surface tier plus a border before any
  shadow.
- `--elevation-overlay` (the blurred one) remains reserved for floating layers
  — menu, popover, modal backdrop-level surfaces, toast.
- `--elevation-press` / `--elevation-press-active` are for the **primary
  action** only: the resting offset and the 2px-displaced pressed state.
  `--elevation-panel` is for the **modal panel** only.
- No other hard offset shadow. Anything else still gets a border.

Do not touch rules 1, 2 and 4–7, and do not restate the four pillars — they are
duplicated in `src/styles/docs/Overview.mdx`, `CLAUDE.md` and
`.design-sync/config.json`, and this task changes none of them.

### 6. The Foundations docs
`src/styles/docs/Elevation.mdx` lists the three current tokens as
**hand-written inline `<div>`s, not a loop** — add three more blocks in the
same shape, and a one-line note under each new one naming its scope. Sanity
point worth honouring: the swatch element in that file is a plain box, so a
`3px 3px 0` and an `8px 8px 0` will look almost identical unless the boxes have
room — give them enough margin that the offset actually reads.

`src/styles/docs/Colors.mdx` hardcodes a `semantics` array of the 14 colour
names. Add the five rail names, ideally as their own small labelled group so a
reader sees they are not part of the light/dark surface ramp.

Nothing tests these MDX files, so a stale array is silent. Diff them against
`_tokens.scss` by eye before you finish.

### Verify
Run from inside the task worktree, never the main checkout:

```bash
npm install && npm run db:setup && npm run lint && npx vitest run --exclude '**/.claude/**' && npx tsc --noEmit && npm run build
```

- `npm run db:setup` matters even here: the SQLite file is gitignored and not
  shared across worktrees, so without it every screen 500s when you open the
  preview.
- Baselines to compare against, disclosed uniformly in the PR body:
  lint **2 errors + 1 info** (`.design-sync/gen-cards.mjs` ×2, `biome.json`);
  tsc **1 error** (`ThemeToggle/theme.helper.test.ts:21`);
  test **45 files / 321 tests** with the worktree exclusion — a plain
  `npm run test` reports 90 / 642 and is meaningless.
- **Never run `npm run lint:fix`.**

### Browser check
Small but not skippable, because a broken Sass build here breaks every task
after it. Start the dev server from inside the worktree on a spare port,
`preview_start` with `{url: "http://localhost:<port>"}`, and confirm with
`javascript_tool`:

```js
getComputedStyle(document.documentElement).getPropertyValue('--rail-bg')
```

resolves to a real colour in light **and** after toggling to dark, and that
`--elevation-press` resolves to `3px 3px 0 <colour>`. Remember that state read
in the SAME call as the action that changed it reports the PRE-change value —
toggle the theme in one call, read in the next.

Also run `npm run storybook` once and open Foundations → Elevation and → Colors
to confirm both pages render the new entries.

### Anything else you touch
Nothing. No component consumes the new tokens in this task, no `.module.scss`
under `src/components` or `src/app` changes, and no `hook.ts` or `index.tsx` is
edited. If the diff reaches outside `src/styles/`, something has gone wrong.

Note for the PR body: `ds-bundle/` and `.design-sync/` hold a **stale mirror**
of the token layer produced by the design-sync skill. They do not auto-update
and this task deliberately leaves them alone — say so, so a reviewer does not
read the drift as an oversight.
