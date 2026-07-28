// Not a spec: playwright's default testMatch only collects `*.spec.ts`, so
// this file is shared setup for the row specs that sit next to it.

// "localhost", matching playwright.config.ts's baseURL — see the comment
// there on why 127.0.0.1 doesn't work against Next 16 dev.
const BASE_URL = "http://localhost:3100";
// One unbroken run of letters, no spaces: the worst case for a name column
// that can only wrap at word boundaries — proves overflow-wrap, not just
// ordinary text wrap, is doing the work.
export const LONG_NAME =
  "Financiamentodoapartamentonovoextraordinariamentelongoesemespacos";
// Person.name caps at 60 (LONG_NAME is 65) — its own word, not a substring
// of LONG_NAME, or the row locators would match both rows.
export const LONG_PERSON_NAME =
  "Reformaestruturaldacoberturaeavarandadositiofamiliar";
// A short-named sibling in the same card as the long-named row on each
// screen, owned by someone else: two rows whose content has nothing in common
// is the only way "the columns line up" can mean anything.
export const SHORT_RECURRENCE = "Luz";
export const SHORT_MOVEMENT = "Bonus";
export const SHORT_GOAL = "Viagem";
// Doubles as the owner of the long-named rows and as Pessoas' own short-named
// sibling — the only list whose rows carry no amount at all.
export const SHORT_PERSON = "Fernanda Alexandrina";

type Named = { id: string; name: string };

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()).data;
}

async function list(path: string): Promise<Named[]> {
  return (await fetch(`${BASE_URL}${path}`).then((r) => r.json())).data ?? [];
}

async function waitFor(path: string, name: string) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if ((await list(path)).some((row) => row.name === name)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`${path} never got a row named ${name}`);
}

// Every spec file's beforeAll runs in its own worker against one shared DB,
// and only Person.name is @unique — so that constraint is the lock. Whoever
// creates SHORT_PERSON writes the rows; everyone else waits for the short
// goal, which is written last.
export async function seed() {
  const owner = await post("/api/people", {
    name: SHORT_PERSON,
    color: "violet",
  });
  if (!owner) return waitFor("/api/goals", SHORT_GOAL);

  const other = await post("/api/people", {
    name: LONG_PERSON_NAME,
    color: "lime",
  });
  await post("/api/recurrences", {
    name: LONG_NAME,
    valueCents: 123456,
    type: "expense",
    ownerId: owner.id,
    months: [202601, 202602, 202603],
  });
  await post("/api/recurrences", {
    name: SHORT_RECURRENCE,
    valueCents: 19990,
    type: "expense",
    ownerId: other.id,
    months: [202602, 202603],
  });
  await post("/api/movements", {
    name: LONG_NAME,
    valueCents: 987654,
    type: "income",
    ownerId: owner.id,
    month: 202601,
  });
  await post("/api/movements", {
    name: SHORT_MOVEMENT,
    valueCents: 45678,
    type: "income",
    ownerId: other.id,
    month: 202602,
  });
  await post("/api/goals", { name: LONG_NAME, targetCents: 500000 });
  await post("/api/goals", { name: SHORT_GOAL, targetCents: 1234567 });
}
