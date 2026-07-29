# Carry the API error code to the client

## Outcome
- A caller of `apiGet`/`apiPost`/`apiPut`/`apiDelete`/`apiUpload` can tell *which*
  failure it got, not just its message.
- Confirming an import of a file already on file closes the dialog and leaves the
  outer Importar button disabled with its "why" tooltip — same end state as a
  successful import, reached from the server's 409 alone.
- Closes `.squad/debt.md:26`.

## Context

**The producer already sends the code.** `src/lib/http.ts` is the single writer:
```ts
export const fail = (message: string, code: string, status = 400) =>
  NextResponse.json({ error: { message, code } }, { status });
```
49 call sites, 11 distinct codes (`validation`, `internal`, `not_found`,
`duplicate`, `conflict`, `already_imported`, `too_large`, `not_ofx`, `card_only`,
`no_statement`, `empty`). Four of those never appear as a literal beside `fail` —
`src/app/api/ofx/route.ts:37` passes the reader's own status enum through as the
code. So `code` stays a `string` on the client; a literal union would be a second
list to keep in sync.

**The consumer drops it.** `src/lib/api.ts`:
```ts
type ApiResult<T> =
  | { data: T; error?: undefined }
  | { data?: undefined; error: string };
...
    return res.ok
      ? { data: body?.data as T }
      : { error: (body?.error?.message as string) ?? "Erro inesperado" };
```

**Watch out for — this is why the change must be additive.** 13 sites across 7
files assign `result.error` straight into a `useState<string>()`, so widening
`error` from `string` to an object breaks all of them:
`EntryScreen/hook.ts` (×2, incl. `const persist = async (result: Awaited<ReturnType<typeof apiPost>>)`),
`SettingsScreen/components/GoalsSection/hook.ts` (×2, same `Awaited<…>` shape),
`.../PeopleSection/hook.ts` (×4), `.../MonthlyGoalSection/hook.ts` (×2 — one is
an unguarded `setError(result.error)` at L30), `DashboardScreen/hook.ts`,
`OfxScreen/hook.ts` (its error state is `useState<string | null>`), and
`ImportAction/hook.ts`. Adding an optional sibling field to the error branch keeps
every one of them compiling and needs no edit outside `api.ts` and ImportAction.
`ApiResult` is not exported — nothing outside `api.ts` names the type.

**Reuse the lever ImportAction already has.** `useImportedRecord` in
`.../ImportAction/imported.hook.ts` returns `[record, setRecord] as const` over
`export type ImportedState = { imported: boolean; importedAt: string | null }`.
`index.tsx` reads it twice, and one write drives both:
```tsx
<Button variant="success" onClick={view.openDialog} disabled={view.imported}>
{view.tooltip ? <Tooltip text={view.tooltip} label="Por que não posso importar" /> : null}
```
`view.imported` is `record.imported`; `view.tooltip` is
`record.imported ? importedHint(record.importedAt) : null`. The success path at
the foot of `submit` already does exactly this shape:
```ts
setRecord({ imported: true, importedAt: new Date().toISOString() });
```
Check what `importedHint(null)` renders before relying on it.

**The failure branch to change**, `.../ImportAction/hook.ts`:
```ts
    setBusy(false);
    if (result.error || !result.data) {
      return setError(result.error ?? "Erro inesperado");
    }
```
Two server paths produce this 409, and the fix must cover both — the service's
own lookup (`src/app/api/ofx-imports/route.ts:38`) and the `P2002` race caught by
`refusal()` at L51. Both already emit the same `already_imported` code.

- **Verify with** `npx tsc --noEmit` (bare — `tsconfig.json` has `noEmit`,
  `strict` and the `@/*` alias; there is no `typecheck` script), `npm run lint`,
  `npm run test:e2e`.

## Scope
- In: `src/lib/api.ts`; `src/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/ImportAction/` (`hook.ts`, and `index.tsx` only if the view contract must grow).
- Out: `src/lib/http.ts` and every `app/api/**` route — the server side is already
  correct. The other 12 assignment sites listed above must need no edit; if one
  does, the change was not additive.

## Verify
```
npx tsc --noEmit
npm run lint
npm run test:e2e
```
`e2e/ofx-import.spec.ts` already pins both end states — `refuses to import the
same file twice` asserts `await expect(trigger).toBeDisabled(SLOW)` plus the
visible `Por que não posso importar` button on a fresh page with empty
sessionStorage. Extend it (or add a sibling) so the **in-dialog** 409 is covered:
today that spec only proves the server-record path, never the submit path.
`trigger` needs `.first()` — the dialog's confirm button carries the same name.

## Forbidden
- Do not change `error`'s type from `string`. Any edit that forces a caller
  outside ImportAction to change has broken the additive contract.
- Do not type `code` as a literal union — `/api/ofx` forwards four codes that
  exist only inside `ReadOfxResult["status"]`.
- Do not make ImportAction parse the message text to detect the 409.
- Do not refetch after the 409 to learn the import date; the success path
  deliberately uses a local clock for the tooltip only.
