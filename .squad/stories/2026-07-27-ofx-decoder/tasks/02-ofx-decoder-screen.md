# OFX Decoder screen

## Outcome
- A 6th nav entry labeled "OFX Decoder" reaches `/ofx-decoder` and highlights
  as active there, on the desktop rail and the mobile bottom nav alike.
- Picking or dropping an OFX renders its whole structure as a collapsible tree
  rooted at `<OFX>`: aggregates expand into their children, leaves show tag
  name plus value exactly as written in the file — no formatting, no unit, no
  reordering, no filtering, no tag left out.
- Everything before `<OFX>` also appears: the 1.x `KEY:VALUE` header lines and
  the 2.x `<?xml?>` / `<?OFX?>` instructions, shown as header entries and never
  as tree nodes named `?xml`.
- Both dialects and accented latin-1 content render correctly; the parse is
  linear-time on a file of repeated unclosed aggregates.
- Uploading fires no request; a refresh returns to the empty state.

## Independently shippable
yes

## Scope
- In: `src/app/ofx-decoder/`, `src/components/AppShell/nav.ts`.
- Out: `/leitor-ofx` and `/api/ofx` — not one line, not one shared helper of
  theirs edited to fit this screen. No new dependency. No search, no export,
  no sessionStorage — the owner cut all three from v1.
- Imitate: `src/app/leitor-ofx/page.tsx` + `_components/OfxScreen/` — thin
  page, screen folder, the index/hook/style split at every depth.
  `src/app/api/ofx/ofx-tags.helper.ts` — its `blocks()` explains in comments
  why the scan is an `indexOf` walk and not a lazy regex; the same hazard
  applies here and stalls the browser's main thread instead of the server.
- Reuse: `decodeOfx` from `src/lib/` (never `file.text()` — it destroys
  latin-1 accents), `FilePicker`/`DropZone` from `src/components/`,
  `PageHeader`, `SectionCard`, `Button`. Native `<details>`/`<summary>` for the
  disclosure — the repo has no accordion and needs none.

## When to run
- Depends on: 01
- Parallel-safe with: none

## Verify
- `npm run lint && npm run test && npm run build`
- The hook cannot be tested (Vitest is `node`, no jsdom), so the tokenizer
  lands as a pure exported helper with a colocated `*.test.ts` — over the
  shapes in `src/app/api/ofx/fixtures.helper.ts` (SGML and XML) plus an
  unclosed aggregate, a tag name that prefixes another, and an accented byte
  sequence like the one in `src/app/api/ofx/decode.helper.test.ts`.
- Measure, don't assume: `wc -l` each file added against the 100-line cap
  (`npm run lint` will not fail on it), and re-read `nav.ts`'s comments — two
  count the screens and go stale at six.
- Manual with the Network panel open on `/ofx-decoder`: load a 1.x and a 2.x
  file, confirm zero requests, expand to a `<STMTTRN>` leaf and compare its
  value against the same line in a text editor; then refresh.
- Manual at 375px: the bottom nav now splits six ways — confirm no label wraps
  or clips, and that hit targets stay >=44px.

## Forbidden
- Any interpretation of a value: no cents math, no date reformatting, no
  currency symbol, no friendly label replacing a tag name.
- Dropping or merging a tag the file contains, including duplicates, empty
  leaves and tags this app has never heard of.
- A lazy `([\s\S]*?)` regex over the file body.
- Sending the file anywhere, or writing it to storage of any kind.
