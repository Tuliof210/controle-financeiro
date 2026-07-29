# A size knob on IconButton that shrinks the paint, not the tap

## Outcome
- A row action button paints noticeably smaller than the 44px it paints today,
  while a 44×44 tap anywhere over it still activates it.
- Two such buttons sitting side by side never contest a tap: no point on screen
  activates `Excluir` when the finger is over `Editar`, or vice versa.
- The Modal close button and the RecurrenceForm interval remove button are
  visually unchanged.

## Context
The design draws these at `--rowbtn`, `30px` on wide screens and `40px` narrow:

```
--rowbtn:30px;                                        /* :root */
@media (max-width:860px){:root{ … --rowbtn:40px}}     /* narrow */
width:var(--rowbtn);height:var(--rowbtn);flex:none;background:transparent;
border:var(--border-1) solid var(--c-line);border-radius:var(--radius-sm);
```

- **The rule that constrains this** — `.squad/learnings.md`: *"The >=44px
  hit-target binds every new interactive element, not just ones reusing
  `IconButton` — hardcode it … or overlay an `::after` when padding would shift
  layout"*.
- **Imitate** `src/components/Tooltip/style.module.scss`, which already does the
  overlay for exactly this reason: *"An overlaid pseudo-element rather than
  padding, so the title row does not grow and the focus ring stays tight on the
  icon. … Raw 44px, as IconButton/ColorPicker do — there is no hit-target token,
  and the 'never hardcode' rule covers colour/space/radius/shadow/duration."*
- **The contract to add.** IconButton must not learn about rows or breakpoints.
  Size it from a custom property it reads and every caller may override:
  `width: var(--icon-btn-size, 44px)` (same for `height`). Tasks 02 and 04 set
  that property from inside their own container query — that is where the
  "narrow" decision belongs, because a row's own width, not the viewport, is the
  honest signal here (see `RowGrid/style.module.scss`: *"this shell moves a row
  BACKWARDS as the window grows"*).
- **Reuse** the focus ring already wired in: `@include t.focus-ring` inside
  `.iconButton:focus-visible`. The ring must stay tight on the painted box, not
  follow the overlay.
- **Call sites, all 8** — `EntryRow/index.tsx` ×2, `GoalRow/index.tsx` ×2,
  `PersonRow/index.tsx` ×2 (all rows, all shrink later), plus
  `Modal/index.tsx:35` and `RecurrenceForm/components/IntervalList/index.tsx:33`
  (both inside modals, both must keep 44px). Neither of the last two sets any
  size of its own — they inherit whatever the default is, so the default stays
  44px and the knob is opt-in.
- **Watch out for the overlap.** Two 30px buttons separated by
  `PAIR_GAP = 8` (`e2e/row.helper.ts`) span 68px end to end; two centred 44px
  overlays need 88px and would overlap by 20px, with the destructive `Excluir`
  overlay painting on top of `Editar` because it is the later sibling. Resolve it
  deliberately — either tile the overlays so they meet without overlapping, or
  widen the pair gap (which means updating `PAIR_GAP` in `e2e/row.helper.ts` in
  this same commit, since `row-columns.spec.ts` asserts it with
  `toBeCloseTo(PAIR_GAP, 0)`). Measure, do not assume.
- **Watch out for the overhang.** An overlay taller than its button pokes into
  the neighbouring row's clickable band. Whatever overhang you end up with must
  not exceed the row's own vertical padding, or the rows above and below become
  partly untappable.
- `src/components/IconButton/style.module.scss` is 67 lines; the cap is 100.

## Scope
- In: `src/components/IconButton/**`, and `e2e/row.helper.ts` only if the pair
  gap changes.
- Out: every row component — no `.tsx` in `src/app/` or `src/components/*Row*`
  is touched here. IconButton's default size does not change.

## Verify
- `npm run lint`
- Drive the browser preview to `/movimentacoes`. In the console, for both row
  buttons: read `getBoundingClientRect()` of the button, then of the `::after`
  box via `getComputedStyle(el, '::after')` — confirm the activation area is
  ≥44×44 and that the two activation areas do not intersect.
- `document.elementFromPoint(x, y)` at the midpoint between the two buttons must
  resolve to exactly one of them, and to the same one on both sides of the seam.
- Keyboard-tab to a row button and confirm the focus ring hugs the painted box.
- Open a Modal and confirm the close button still measures 44×44.

## Forbidden
- Changing IconButton's default rendered size, or its `ghost`/`danger` variants.
- Adding padding to reach the hit target — it would shift the row's layout, which
  is the reason Tooltip chose an overlay.
- A viewport media query. The size knob is set by callers, from a container query.
- `overflow: hidden` anywhere on this component or its ancestors — it clips both
  the overlay and the outline-offset focus ring.
