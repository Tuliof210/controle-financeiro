# Give the OFX report a SHA-256 of the file it came from

## Outcome
- `POST /api/ofx` returns a `fileHash` on the report: the hex SHA-256 of the uploaded
  bytes, stable across re-uploads of the same file and different for any other file.
- A report cached in `sessionStorage` by an older build reads as absent rather than as a
  report with no hash.

## Context
- **The bytes exist in exactly one place** — `src/app/api/ofx/route.ts`, an anonymous
  temporary never bound to a variable:
  ```ts
  const result = readOfx(new Uint8Array(await file.arrayBuffer()), file.name);
  return result.status === "ok"
    ? ok(result.report)
    : fail(MESSAGES[result.status], result.status, 422);
  ```
  Bind it, hash it, and attach the hash to the report on the way out. `MAX_BYTES = 5 * 1024 * 1024`
  a few lines above is what bounds the hash input.
- **Watch out for** the purity invariant. `src/app/api/ofx/service.ts:13-14` says
  verbatim: "Pure, like getHealth: no repository, no Prisma, nothing persisted. The whole
  route is a function over the uploaded bytes." Hashing is pure and does not break it —
  reading or writing the database here would. Keep the route DB-free.
- **Reuse** `readOfx(bytes: Uint8Array, fileName: string): ReadOfxResult` and
  `buildReport(parse: OfxParse, fileName: string): OfxReport` — both already receive
  enough to carry a hash through; pick the seam that keeps each file under 100 lines.
- **Nothing in this repo hashes anything yet** — `node:crypto`, `createHash` and
  `crypto.subtle` have zero occurrences in `src/`. `createHash("sha256").update(bytes).digest("hex")`
  from `node:crypto` works in a Route Handler; there is no house precedent to imitate,
  so pick one and stay server-side (the client never keeps the `File` — see below).
- **Imitate** the defensive parse in `src/app/leitor-ofx/_components/OfxScreen/session.helper.ts`,
  which is the only gate on cached data:
  ```ts
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed?.months) && Array.isArray(parsed?.accounts)
    ? (parsed as OfxReport)
    : null;
  ```
  A report cached before this task has no `fileHash`; add it to that condition so the
  stale entry is dropped instead of flowing into task 04 with `undefined`.
- **Watch out for** the client dropping the `File`. `OfxScreen/hook.ts` stores only
  `result.data` in `sessionStorage` and keeps `fileName` as display state that is
  explicitly "Deliberately not persisted" — so a hash the client is to reuse has to
  travel inside the report, not be recomputed in the browser.
- **Watch out for** `OfxReport` being the response type of a route the reader screen
  reads on every mount: making `fileHash` optional would push the `undefined` case into
  every consumer. Make it required and let `session.helper.ts` filter stale cache.

## Scope
- In: `src/app/api/ofx/{route.ts,service.ts,types.ts,report.helper.ts}`,
  `src/app/leitor-ofx/_components/OfxScreen/session.helper.ts`
- Out: `src/app/api/ofx-imports/` (task 01 owns it), the OFX decoder screen under
  `src/app/ofx-decoder/`, and everything under `ReportView/`

## Verify
- With the dev server running, upload the same OFX twice and confirm `fileHash` is byte
  identical; confirm `shasum -a 256 <the-file>` prints the same hex.
- Upload a second, different OFX and confirm the hash differs.
- Put a hash-less report object into `sessionStorage` under the key `ofx-report`, reload
  `/leitor-ofx`, and confirm the upload card renders rather than a report.
- `npm run lint` && `npm run build`.
- `wc -l` every file you created or touched — `src/app/api/ofx/route.ts` and
  `report.helper.ts` are both already close to the cap; measure, do not estimate.

## Forbidden
- Do not persist anything from `/api/ofx` — no Prisma import, no repository call.
- Do not hash in the browser, and do not keep the `File` object in client state to make
  that possible.
- Do not change the `{ data }` / `{ error: { message, code } }` envelope or any of the
  `MESSAGES` refusal statuses.
- Do not change the sessionStorage key `ofx-report`.
