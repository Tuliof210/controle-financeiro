# Parse an OFX upload into monthly totals — `POST /api/ofx`

## Description
Build the whole server half of the OFX reader: a tolerant OFX parser and a
stateless Route Handler that turns an uploaded file into a monthly
income/expense report as JSON.

**This route touches no database.** No repository import, no Prisma import, no
migration. `src/app/api/health/` is the precedent that a service may be pure —
it has no `infra/` import at all. Everything here is a pure function over a
byte array, which is also why almost all of it is unit-testable.

Three facts about OFX that shape the design, all verified:

1. **OFX 1.x is SGML, 2.x is XML — one scanner reads both.** In 1.x, *leaf*
   elements omit the closing tag (`<TRNAMT>-1234.56` followed by a newline),
   but *aggregates* are closed (`</STMTTRN>`, `</STMTRS>`). So `<TAG>value` up
   to the next `<` covers leaves in both dialects, and
   `<TAG>…</TAG>` covers aggregates in both.
2. **Brazilian banks ship OFX 1.x as ISO-8859-1.** Node here is v25.9.0 with
   full ICU: `new TextDecoder("iso-8859-1")` works and resolves to the
   `windows-1252` decoder (WHATWG aliases them, which is strictly more
   forgiving). **Do not add an encoding dependency** — verified unnecessary.
3. **Amounts are not always spec-clean.** `-1234.56` is the spec, but
   `1.234,56` and `1234` both occur. The parser handles all three by treating
   whichever of `.` or `,` appears *last* as the decimal separator.

The route is the repo's first multipart endpoint. `safeJson` in
`src/lib/http.ts` does not apply (it calls `request.json()`), and
`request.formData()` throws on a malformed or absent multipart body **before**
any validation runs — the exact failure mode `.squad/learnings.md` records as
invisible to the test suite, because this repo colocates tests with
`service.ts` and never with `route.ts`. So: a `safeFormData` sibling in
`http.ts`, plus mandatory manual smoke cases listed at the bottom.

## When to run
- Depends on: none
- Parallel-safe with: none (02 and 03 both consume the types this task defines)

## How-to

### Files created
```
src/app/api/ofx/types.ts
src/app/api/ofx/decode.helper.ts          + decode.helper.test.ts
src/app/api/ofx/ofx-tags.helper.ts        + ofx-tags.helper.test.ts
src/app/api/ofx/parse.helper.ts           + parse.helper.test.ts
src/app/api/ofx/report.helper.ts          + report.helper.test.ts
src/app/api/ofx/service.ts                + service.test.ts
src/app/api/ofx/route.ts
src/app/api/ofx/fixtures.helper.ts        (synthetic OFX strings, NOT collected by vitest)
```
Files edited: `src/lib/http.ts` (one new export).

Follow `src/app/api/dashboard/` for every convention: helpers are
`<subject>.helper.ts` with a colocated `<subject>.helper.test.ts`, shared types
live in a sibling `types.ts`, shared test factories live in a
`fixtures.helper.ts` carrying a comment explaining it is not a `*.test.ts` so
Vitest does not collect it.

### 1. `types.ts`
Mirror `src/app/api/dashboard/types.ts`: `export type` only (never
`interface`), unit-carrying trailing comments, discriminated unions on a
`status` string.

```ts
// The OFX read model — one uploaded statement file turned into monthly totals.
// Nothing here is persisted: it is produced per request and cached by the
// client in sessionStorage.

// One checking account found in the file. Every field is nullable because OFX
// exports in the wild omit tags the spec marks required.
export type OfxAccount = {
  bankId: string | null;
  accountId: string | null;
  accountType: string | null; // CHECKING / SAVINGS / … verbatim from the file
  balanceCents: number | null; // <LEDGERBAL><BALAMT>
  balanceMonth: number | null; // YYYYMM of <DTASOF>
  start: number | null; // YYYYMM of <DTSTART>
  end: number | null; // YYYYMM of <DTEND>
};

export type OfxMonth = {
  month: number; // YYYYMM
  incomeCents: number; // sum of positive <TRNAMT>, cents, >= 0
  expenseCents: number; // absolute sum of negative <TRNAMT>, cents, >= 0
  balanceCents: number; // income - expense, may be negative
  count: number; // transactions posted in this month
};

export type OfxReport = {
  fileName: string;
  org: string | null; // <FI><ORG>, the institution's name
  fid: string | null;
  currency: string | null; // <CURDEF>, e.g. "BRL"
  accounts: OfxAccount[];
  // Ascending and gap-free: every month from the period start to the period
  // end inclusive, zero-filled where the statement has no transaction.
  months: OfxMonth[];
  totals: {
    incomeCents: number;
    expenseCents: number;
    balanceCents: number;
    count: number;
  };
};
```

### 2. `decode.helper.ts`
```ts
// OFX 1.x from Brazilian banks is usually ISO-8859-1; OFX 2.x is XML and
// usually UTF-8. Rather than reading the CHARSET/ENCODING header — which banks
// fill in wrong — try UTF-8 strictly and fall back: a latin-1 accent IS an
// invalid UTF-8 sequence, so the throw is the detection. `iso-8859-1` and
// `windows-1252` resolve to the same decoder per the WHATWG Encoding Standard.
export function decodeOfx(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}
```
Test with three `Uint8Array`s: pure ASCII, UTF-8 bytes for `"ção"`
(`[0xc3,0xa7,0xc3,0xa3,0x6f]`), and latin-1 bytes `[0xe7,0xe3,0xf5]` which must
decode to `"çãõ"`.

### 3. `ofx-tags.helper.ts` — the primitives
Split out from `parse.helper.ts` on purpose: these four are where every parsing
bug will live, they are trivially unit-testable, and keeping them here holds
both files under the 100-line cap.

```ts
// A leaf element's value. OFX 1.x omits leaf closing tags, so the value runs
// to the next `<`; OFX 2.x closes them, and `[^<]*` stops in the same place.
// Empty or whitespace-only reads as absent.
export function leaf(block: string, tag: string): string | null

// Every occurrence of an aggregate's inner text. Aggregates ARE closed in both
// dialects, so one pattern serves both. Non-greedy, so sibling aggregates do
// not collapse into one match.
export function blocks(text: string, tag: string): string[]

// "-1234.56" | "1.234,56" | "1234" -> integer cents. Whichever of `.` or `,`
// comes LAST is the decimal separator; any earlier one is a thousands mark
// banks add against the spec. Digits are read as strings so no float rounds.
// Unparseable input returns null rather than 0 — a silent 0 would land in a
// total as a real transaction of nothing.
export function amountToCents(raw: string): number | null

// <DTPOSTED> is YYYYMMDD[HHMMSS][[-3:BRT]] — the first six digits already ARE
// the YYYYMM this whole app uses. Anything that is not a valid month returns
// null and the transaction is dropped.
export function dateToMonth(raw: string): number | null
```

Reference implementations (write them in this shape, keep the comments):

```ts
export function leaf(block: string, tag: string): string | null {
  const value = new RegExp(`<${tag}>([^<]*)`).exec(block)?.[1].trim();
  return value ? value : null;
}

export function blocks(text: string, tag: string): string[] {
  const pattern = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g");
  return [...text.matchAll(pattern)].map((match) => match[1]);
}

export function amountToCents(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "");
  const cut = Math.max(cleaned.lastIndexOf("."), cleaned.lastIndexOf(","));
  const normalized =
    cut < 0
      ? cleaned
      : `${cleaned.slice(0, cut).replace(/[.,]/g, "")}.${cleaned.slice(cut + 1)}`;
  const match = /^([+-]?)(\d+)(?:\.(\d*))?$/.exec(normalized);
  if (!match) {
    return null;
  }
  const [, sign, whole, fraction = ""] = match;
  // OFX amounts carry two decimals; a third digit is truncated, not rounded.
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0").slice(0, 2));
  return sign === "-" ? -cents : cents;
}

export function dateToMonth(raw: string): number | null {
  const digits = raw.replace(/\D/g, "").slice(0, 6);
  if (digits.length < 6) {
    return null;
  }
  const month = Number(digits);
  const inYear = month % 100 >= 1 && month % 100 <= 12;
  return inYear && month >= 190001 && month <= 999912 ? month : null;
}
```

`ofx-tags.helper.test.ts` — this is the file that earns its keep, cover at
minimum:
- `leaf`: SGML form (`"<TRNAMT>-10.50\n<FITID>x"` → `"-10.50"`), XML form
  (`"<TRNAMT>-10.50</TRNAMT>"` → `"-10.50"`), missing tag → `null`,
  present-but-empty (`"<MEMO>\n<X>"`) → `null`, and that `<ACCTID>` does not
  match inside `<ACCTTYPE>`.
- `blocks`: zero matches → `[]`, one, three siblings each returning only its
  own text, and that a `<STMTTRN>` block does not swallow the next one.
- `amountToCents`: `"-1234.56"` → `-123456`; `"1234.56"` → `123456`;
  `"1.234,56"` → `123456`; `"1234"` → `123400`; `"1234.5"` → `123450`;
  `"-0.01"` → `-1`; `"+10.00"` → `1000`; `" 10.00 "` → `1000`; `"abc"` →
  `null`; `""` → `null`.
- `dateToMonth`: `"20260715"` → `202607`; `"20260715120000[-3:BRT]"` →
  `202607`; `"2026"` → `null`; `"20261315"` → `null`; `"abc"` → `null`.

### 4. `parse.helper.ts` — structure
```ts
export type OfxTransaction = { month: number; cents: number };

export type OfxStatement = {
  account: OfxAccount;
  currency: string | null;
  transactions: OfxTransaction[];
};

export type OfxParse = {
  org: string | null;
  fid: string | null;
  statements: OfxStatement[];
  // How many <CCSTMTRS> aggregates were seen and skipped. The service uses it
  // to tell "this is a credit-card export" apart from "this is not an OFX".
  cardBlocks: number;
};

export function parseOfx(text: string): OfxParse
```

Body:
- `org` / `fid` — `leaf(text, "ORG")`, `leaf(text, "FID")`.
- `cardBlocks` — `blocks(text, "CCSTMTRS").length`. Credit-card statements are
  out of scope by decision; count them, do not read them.
- `statements` — `blocks(text, "STMTRS").map(...)`. Per block:
  - `currency` — `leaf(block, "CURDEF")`
  - `bankId` / `accountId` / `accountType` — `leaf(block, "BANKID" | "ACCTID" |
    "ACCTTYPE")`
  - `start` / `end` — `dateToMonth` over `leaf(block, "DTSTART" | "DTEND")`
  - `balanceCents` / `balanceMonth` — from the first `blocks(block,
    "LEDGERBAL")[0]`, via `amountToCents(leaf(…, "BALAMT"))` and
    `dateToMonth(leaf(…, "DTASOF"))`
  - `transactions` — `blocks(block, "STMTTRN")` mapped through `dateToMonth` /
    `amountToCents`, dropping any entry where either is `null` (a transaction
    with no usable date or amount cannot be summed into a month; dropping it is
    the only honest option and it is why `amountToCents` returns `null` rather
    than `0`).

Keep the per-statement mapping in a module-private
`function readStatement(block: string): OfxStatement` so `parseOfx` itself
stays short and the 100-line cap holds.

`parse.helper.test.ts` — drive it from `fixtures.helper.ts` (below): the SGML
fixture yields one statement with the expected account fields and 4
transactions; the XML fixture yields the same numbers from the other dialect;
the two-account fixture yields 2 statements; the card-only fixture yields 0
statements and `cardBlocks === 1`; a garbage string yields 0 statements, 0
cards and null org.

### 5. `report.helper.ts` — aggregation
```ts
export function buildReport(parse: OfxParse, fileName: string): OfxReport
```

- Flatten every statement's transactions into one list — the owner's decision
  is that a multi-account file produces **one** table; the accounts array is
  what keeps the composition visible.
- Sum per month into a `Map<number, OfxMonth>`: positive `cents` adds to
  `incomeCents`, negative adds its absolute value to `expenseCents`, both bump
  `count`. A `cents` of exactly `0` bumps `count` only.
- Determine the rendered range, then `buildMonths(start, end)` from
  `@/lib/months` and materialise every month, zero-filled:
  ```ts
  // The period is the declared <DTSTART>/<DTEND> widened to cover every
  // transaction — an export whose transactions fall outside its own declared
  // window must not lose a month.
  ```
  ```ts
  const MAX_SPAN = 240; // 20 years of rows
  ```
  and after computing `start`/`end`: if the span exceeds `MAX_SPAN`, discard
  the declared bounds and fall back to the transactions' own min/max. A
  corrupt `<DTEND>` of `99991231` would otherwise ask `buildMonths` for ~950k
  rows and hang the request. Comment it as the guard it is.
- With no transactions **and** no usable declared range, return `months: []` —
  the service maps that to an error, so `buildReport` does not need its own.
- `fileName` — store `fileName.slice(0, 120)`. It comes from the upload and is
  rendered in the UI; there is no reason to carry an unbounded string.
- `currency` — the first non-null `statement.currency`.
- `totals` — summed from `months`, so the table's total row and the payload's
  cannot diverge.

`report.helper.test.ts` — at minimum:
- entradas/saídas split by sign, with a known-total fixture;
- a month with no transaction inside the period renders as a zero row with
  `count: 0`, and the months come back ascending and gap-free;
- a transaction outside the declared `DTSTART`/`DTEND` still gets its own row
  (the widening rule);
- two statements sum into one month;
- `totals` equals the column sums of `months` — assert it against the summed
  rows, not against a restated literal, so the invariant is what is pinned;
- the `MAX_SPAN` guard: a statement declaring `19000101`–`99991231` with two
  transactions returns only the transactions' own months;
- no transactions and no range → `months: []`.

### 6. `service.ts`
Framework-agnostic — no `NextRequest`/`NextResponse` import. Discriminated
union on `status`, mirroring `DashboardData`:

```ts
export type ReadOfxResult =
  | { status: "ok"; report: OfxReport }
  | { status: "not_ofx" } // no <OFX at all — a PDF, a CSV, a truncated file
  | { status: "card_only" } // only <CCSTMTRS>: out of scope by decision
  | { status: "no_statement" } // an OFX, but no checking-account statement
  | { status: "empty" }; // a statement with zero usable transactions

export function readOfx(bytes: Uint8Array, fileName: string): ReadOfxResult {
  const text = decodeOfx(bytes);
  if (!text.includes("<OFX")) {
    return { status: "not_ofx" };
  }
  const parse = parseOfx(text);
  if (parse.statements.length === 0) {
    return parse.cardBlocks > 0
      ? { status: "card_only" }
      : { status: "no_statement" };
  }
  const report = buildReport(parse, fileName);
  return report.totals.count === 0
    ? { status: "empty" }
    : { status: "ok", report };
}
```
A statement whose every row is zero would render a table of zeros that answers
nothing — `empty` is the honest response, not a valid report.

`service.test.ts` — one case per status, driven through **bytes**, not strings
(`new TextEncoder().encode(fixture)`), so decoding is exercised end to end.
Add one latin-1 case: encode a fixture whose `<ORG>` is `"Banco Sao Joao"` with
byte `0xE3` in place of the `a` of `Sao` and assert `report.org` contains
`"São"`.

### 7. `src/lib/http.ts` — `safeFormData`
Add directly below `safeJson`, same shape and same reasoning:

```ts
// Same trust boundary as safeJson: request.formData() throws on a malformed or
// absent multipart body, before any validation runs.
export async function safeFormData(
  request: Request,
): Promise<FormData | undefined> {
  try {
    return await request.formData();
  } catch {
    return undefined;
  }
}
```

### 8. `route.ts`
Thin controller. `src/app/api/goals/route.ts` is the shape; `dashboard/route.ts`
is the precedent for a route that deliberately has **no Zod schema** and says so
in a comment.

```ts
import type { NextRequest } from "next/server";
import { fail, ok, safeFormData } from "@/lib/http";
import { readOfx } from "./service";

// 5 MB. next.config.ts sets no body limit for Route Handlers, so the cap has
// to live here — an OFX year is tens of KB, so this is generous by 100x.
const MAX_BYTES = 5 * 1024 * 1024;

// No Zod: the body is a file, not a JSON shape. The trust-boundary checks are
// the instanceof and the size guard below; everything past them is a byte
// array the parser treats as untrusted anyway.
const MESSAGES: Record<string, string> = {
  not_ofx: "Arquivo não parece ser um OFX.",
  card_only:
    "Este arquivo tem apenas fatura de cartão. O leitor processa extrato de conta corrente.",
  no_statement: "Nenhum extrato de conta corrente encontrado no arquivo.",
  empty: "Nenhuma transação encontrada no extrato.",
};

export async function POST(request: NextRequest) {
  const form = await safeFormData(request);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return fail("Envie um arquivo OFX", "validation", 422);
  }
  if (file.size > MAX_BYTES) {
    return fail("Arquivo maior que 5 MB", "too_large", 413);
  }

  const result = readOfx(new Uint8Array(await file.arrayBuffer()), file.name);
  return result.status === "ok"
    ? ok(result.report)
    : fail(MESSAGES[result.status], result.status, 422);
}
```
Do **not** add `export const runtime`/`dynamic` — there is not one anywhere in
`src/`. `File`, `FormData` and `TextDecoder` are all in the `lib.dom` type set
already configured in `tsconfig.json`; no config change is needed.

### 9. `fixtures.helper.ts`
```ts
// OFX samples shared by this folder's test suites. Not a *.test.ts file, so
// Vitest does not collect it, and no app code imports it.
//
// SYNTHETIC DATA ONLY — fixtures under src/ are committed (.gitignore covers
// only /src/generated/prisma). Never paste a real bank export in here.
```
Export at least: `SGML_STATEMENT` (OFX 1.x, one account, 4 transactions across
two months, two of them positive), `XML_STATEMENT` (OFX 2.x, the same numbers),
`TWO_ACCOUNTS`, `CARD_ONLY` (a `<CCSTMTRS>` block and nothing else). Starting
point for the first — keep the header block, banks send it and the parser must
tolerate it:

```
OFXHEADER:100
DATA:OFXSGML
VERSION:102
CHARSET:1252

<OFX><SIGNONMSGSRSV1><SONRS><STATUS><CODE>0</STATUS>
<FI><ORG>Banco Teste<FID>001</FI></SONRS></SIGNONMSGSRSV1>
<BANKMSGSRSV1><STMTTRNRS><STMTRS><CURDEF>BRL
<BANKACCTFROM><BANKID>001<ACCTID>12345-6<ACCTTYPE>CHECKING</BANKACCTFROM>
<BANKTRANLIST><DTSTART>20260101<DTEND>20260228
<STMTTRN><TRNTYPE>CREDIT<DTPOSTED>20260105<TRNAMT>3000.00<FITID>1<MEMO>Salario</STMTTRN>
<STMTTRN><TRNTYPE>DEBIT<DTPOSTED>20260110<TRNAMT>-450.25<FITID>2<MEMO>Mercado</STMTTRN>
<STMTTRN><TRNTYPE>DEBIT<DTPOSTED>20260212<TRNAMT>-1200.00<FITID>3<MEMO>Aluguel</STMTTRN>
<STMTTRN><TRNTYPE>CREDIT<DTPOSTED>20260220<TRNAMT>150.00<FITID>4<MEMO>Estorno</STMTTRN>
</BANKTRANLIST><LEDGERBAL><BALAMT>1499.75<DTASOF>20260228</LEDGERBAL>
</STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>
```
Expected: Jan/26 → income 300000, expense 45025; Feb/26 → income 15000,
expense 120000; totals income 315000, expense 165025, count 4.

### Verify
Run from inside the task worktree, never the main checkout:

```bash
npm install && npm run lint && npm run test && npx tsc --noEmit && npm run build
```

- `npm run test` from the main checkout globs `.claude/worktrees/*`. Baseline
  measured from inside: **33 files / 237 tests**.
- `npm run lint` baseline: **2 errors + 1 info**, all outside `src/`
  (`.design-sync/gen-cards.mjs` × 2, `biome.json` deprecation info). Report NEW
  ones only; never run `npm run lint:fix`.
- `npx tsc --noEmit` baseline: **1 error**, `ThemeToggle/theme.helper.test.ts`.
  Disclose it in the PR body in the same terms as the lint baseline.
- Count lines by hand on every new file: `noExcessiveLinesPerFile` is
  configured at `maxLines: 100` but emits **nothing** — verified silent on a
  1562-line file. The gate will not catch an overflow.
- `npm run db:setup` is not needed here — this task never opens the database.
  Run it anyway before the manual smoke below, since the dev server boots the
  whole app and the SQLite file is not shared across worktrees.

### Manual smoke (route.ts has zero automated coverage by repo convention)
Start the dev server from inside the worktree on a spare port and curl it.
These four cases live entirely in `route.ts` and no test will ever see them:

```bash
curl -s -X POST localhost:3001/api/ofx -F "file=@sample.ofx" | head -c 400
```
```bash
curl -s -i -X POST localhost:3001/api/ofx -F "nope=1" | head -3
```
```bash
curl -s -i -X POST localhost:3001/api/ofx -H "content-type: application/json" -d '{}' | head -3
```
```bash
head -c 6000000 /dev/urandom > /tmp/big.ofx && curl -s -i -X POST localhost:3001/api/ofx -F "file=@/tmp/big.ofx" | head -3
```
Expected: `200` with `{"data":{…}}`; `422 validation`; `422 validation` (not a
500 — this is the `safeFormData` catch doing its job); `413 too_large`. Every
one must return the `{error:{message,code}}` envelope, never an empty body.

### Anything else you touch
Nothing. No new dependency (the encoding fallback is built into Node's
`TextDecoder` — verified), no Prisma schema change, no migration, no edit to
any existing route, component or style. The only pre-existing file edited is
`src/lib/http.ts`, and only to append `safeFormData`.
