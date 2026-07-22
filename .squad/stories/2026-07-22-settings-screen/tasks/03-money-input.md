# MoneyInput — cents-integer masked money field

## Description
Build the app's shared money input as the first real DS component. It works
in **integer cents** and never touches floats. The displayed value is masked
with a comma decimal separator and left-padded with zeros so it always shows
two decimals; **typing and paste accept only digits 0–9**, and the comma +
padding come purely from the mask. New digits append from the right (calc /
POS style):

| stored cents | displayed |
|---|---|
| `0` | `0,00` |
| `5` | `0,05` |
| `123` | `1,23` |
| `123456` | `1234,56` |

Reused by Meta mensal and Objetivos now, and every future money field.

## When to run
- Depends on: none
- Parallel-safe with: everything (pure UI, no DB)

## How-to
This is the first `src/components/` DS component. Follow the mandatory
three-file structure from `.squad/ARCHITECTURE.md` (`index.tsx` blindly
renders `hook.ts`; `style.module.scss` consumes tokens via `@use "theme" as t;`).
Model the folder shape on `src/components/AppShell/components/Aside/components/NavItem/`.

**Folder**: `src/components/MoneyInput/`
- `money.helper.ts` — the two pure functions (isolated so they're testable
  without React):
  ```ts
  // cents -> "1234,56". padStart(3) guarantees at least "0,0X".
  export const formatCents = (cents: number): string => {
    const s = String(Math.abs(Math.trunc(cents))).padStart(3, "0");
    return `${s.slice(0, -2)},${s.slice(-2)}`;
  };

  // any string -> cents, keeping ONLY 0-9 (mask/comma/paste-junk stripped).
  const MAX_CENTS = 1_000_000_000_00; // R$ 1 trillion guard against overflow
  export const digitsToCents = (raw: string): number => {
    const digits = raw.replace(/\D/g, "").slice(0, 15);
    return Math.min(parseInt(digits || "0", 10), MAX_CENTS);
  };
  ```
- `money.helper.test.ts` (Vitest, colocated) — assert:
  `formatCents(0) === "0,00"`, `formatCents(5) === "0,05"`,
  `formatCents(123) === "1,23"`, `formatCents(123456) === "1234,56"`;
  `digitsToCents("") === 0`, `digitsToCents("1,2" + "4") === 124` (mask +
  new digit), `digitsToCents("abc50def") === 50` (paste junk stripped),
  `digitsToCents("R$ 1.234,56") === 123456`. This is the story's required
  digits-only proof.
- `hook.ts` — props `{ valueCents: number; onChange: (cents: number) => void;
  id?: string; ariaLabel?: string }`. Returns the display string
  (`formatCents(valueCents)`), an `inputMode: "decimal"` hint, and an
  `onChange` handler that reads `e.target.value`, runs `digitsToCents`, and
  calls the prop `onChange`. Because we reformat on every change, the caret
  naturally sits at the end — correct for a grows-from-the-right field. No
  local state; the parent owns the cents (controlled component).
- `index.tsx` — renders an `R$` prefix adornment + the `<input>`:
  ```tsx
  <div className={styles.field}>
    <span className={styles.prefix} aria-hidden>R$</span>
    <input
      className={styles.input}
      inputMode="decimal"
      value={display}
      onChange={onChange}
      id={id}
      aria-label={ariaLabel}
    />
  </div>
  ```
- `style.module.scss` — angular DS look: `--color-surface` bg, `--border-2`
  solid `--color-border`, `--radius-md`, mono font, `font-variant-numeric:
  tabular-nums` on the input (money rule from `src/styles/README.md`),
  `--space-*` padding, right-aligned digits. Focus ring via
  `@include t.focus-ring;` on `:focus-within`. Prefix uses
  `--color-text-muted`. No hardcoded values — tokens only.

Keep the `R$` purely presentational (never part of the typed value). Do not
add thousands grouping — the spec is comma-decimal + zero-pad only. `//
ponytail: no thousands grouping; add a "." grouper in formatCents when large
goals need it.`

Everything under 100 lines (trivial here).

## Verification
- `npm run test` — `money.helper.test.ts` passes.
- `npm run lint` — Biome all-green.
- Once task 05 mounts it (or a throwaway harness): typing letters does
  nothing, typing `12345` shows `123,45`, pasting `R$ 9.9` yields `0,99`,
  backspacing removes the rightmost digit.
