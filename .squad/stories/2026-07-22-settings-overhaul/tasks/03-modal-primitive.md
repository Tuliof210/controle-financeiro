# Modal primitive + ConfirmDialog

## Description
Build the app's first overlay component: a reusable **Modal**, plus a thin
**ConfirmDialog** wrapper for delete confirmations. No modal/dialog/popover
exists anywhere today (confirmed: no component, no native `<dialog>`, no
portal). The overlay tokens are already defined but unused — `--z-modal: 1300`,
`--z-overlay: 1200`, and `--elevation-overlay` (the blur-shadow the constitution
reserves for "menu, popover, modal, toast"). Tasks 05/06/07 all depend on this.

## When to run
- Depends on: none
- Parallel-safe with: 01, 02, 04

## How-to
**Use the native `<dialog>` element** (`showModal()`), not a hand-rolled portal.
It gives focus-trapping, `Esc`-to-close, the top-layer, and a `::backdrop` for
free — far less code than a custom overlay, and accessible by default. `react-dom`
19 is available if a portal is ever needed, but `<dialog>` shouldn't need one.

**1. `src/components/Modal/`** (three files):
- `index.tsx` — thin: renders `<dialog>` with a header (title + a close
  IconButton/`X`), the `children` body, and an optional `footer` slot for
  actions. Blindly renders what `hook.ts` returns.
- `hook.ts` — owns a `ref` to the `<dialog>`; an effect calls
  `dialog.showModal()` when `open` is true and `dialog.close()` when false;
  wires `onClose` to the dialog's native `close` event (fires on `Esc` and
  programmatic close) and to a backdrop click (compare `e.target === dialogEl`,
  or click outside the inner content box). Return the ref, handlers, and props.
- `style.module.scss` — angular (`--radius-0`), **border-first**: a
  `--color-surface-raised` panel with a `--border-2 solid --color-border`, plus
  `@include t.elevation(overlay)` for the float. Style `::backdrop` (a dimmed
  scrim). Panel `max-width` + responsive width via `@include t.bp(...)`. Respect
  reduced motion (handled at the token layer — don't add ad-hoc transitions that
  ignore it). No hardcoded values — tokens only.
- Props: `{ open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }`.

**2. `src/components/ConfirmDialog/`** (three files) — a thin wrapper over
`Modal` for destructive confirms (used by delete in tasks 05 + 06, so it's
shared from the start). Props:
`{ open; onClose; onConfirm; title; message; confirmLabel?; danger? }`. Renders
a `Modal` with the `message` as body and a footer of two Buttons: a `ghost`
**Cancelar** (calls `onClose`) and a `danger` **Excluir** (calls `onConfirm`).
Keep it tiny — it just composes `Modal` + `Button`.

**Accessibility (non-negotiable):** focus moves into the dialog on open and
returns to the trigger on close (native `<dialog>` handles the trap + return;
verify it does in this Next/React setup and add an explicit focus-return in the
close handler if not); every control has the focus ring; the close control has
an `aria-label`; `Esc` and backdrop both close.

**Exemplars:** `Button/` and the new `IconButton/` (task 02) for the close
button; `_theme.scss` (`elevation`, `bp`, `focus-ring`); `_tokens.scss`
(`--z-modal`, `--color-surface-raised`, `--elevation-overlay`).

**Note (coordination):** `IconButton` comes from task 02. If 02 hasn't merged
into your branch point, use a plain `Button` for the close control and leave a
`ponytail:` note to swap it — don't block on it. Style angular from the start so
task 02's flatten pass finds nothing to change here.

**Do NOT:** add animations libraries, a portal, a focus-trap dependency, or a
stacking/multi-modal manager (YAGNI — one modal at a time is all any flow needs).

**Verification:**
- `npm run lint`, `npm run test`, `npm run build` all green.
- A throwaway harness or an existing page: open a Modal — it appears centered
  over a dimmed backdrop; `Esc` closes; backdrop click closes; the close button
  closes; focus is trapped inside while open and returns to the trigger after.
  Confirm in the browser preview (screenshot + `read_page` for the focus/aria
  structure), in **both themes**. Remove the harness before finishing (or land
  it behind a story-only route that 05/06/07 will replace).
