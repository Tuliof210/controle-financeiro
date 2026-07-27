# Promote the upload primitives to their shared homes

## Outcome
- `decodeOfx` lives in `src/lib/`, `FilePicker` and `DropZone` live in
  `src/components/`, each importable by a second screen.
- Leitor OFX behaves identically: drag-drop, file picker, report, error copy.
- No file outside those moves and their importers changes.

## Independently shippable
yes

## Scope
- In: `src/app/api/ofx/decode.helper.ts` (+ its test), `src/lib/`,
  `src/app/leitor-ofx/_components/OfxScreen/components/{DropZone,FilePicker}/`,
  `src/components/`, and only the import lines that break from the moves.
- Out: any parsing/behavior change; `UploadCard` and `LoadingCard` stay where
  they are (still single-consumer); `ofx-tags.helper.ts`, `parse.helper.ts`,
  `service.ts` logic; the `/api/ofx` contract.
- Imitate: `src/lib/months.ts` — `src/lib/` uses bare names, no `.helper.ts`
  suffix, so the promoted decoder is not `decode.helper.ts`.
- Reuse: the moved files verbatim — this is a move, not a rewrite. `DropZone`
  keeps its hardcoded copy and its exported `dropHandlers`.

## When to run
- Depends on: none
- Parallel-safe with: none (02 imports what this moves)

## Verify
- `npm run lint && npm run test && npm run build`
- `git grep -n "decode.helper\|OfxScreen/components/DropZone\|OfxScreen/components/FilePicker"`
  returns nothing.
- Manual on `/leitor-ofx`: drag a file onto the zone, then use the picker
  button, then the picker inside the report view — all three still load.

## Forbidden
- Renaming an exported symbol, or changing any prop signature.
- Adding a barrel file, or a re-export shim at the old path.
- Leaving a moved file's test behind in the old folder.
