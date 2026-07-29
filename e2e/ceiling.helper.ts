// Not a spec — playwright only collects `*.spec.ts`. Fixture for the dashboard
// ceiling card, kept out of seed.helper.ts so the four row specs keep the exact
// data they were written against.

// "localhost", matching playwright.config.ts's baseURL — see that file on why
// 127.0.0.1 doesn't work against Next 16 dev.
const BASE_URL = "http://localhost:3100";

export const CEILING_PERSON = "Dona do Teto";
export const RED_PERSON = "Dono do Vermelho";
// The FIRST red month closes this far under; the deepest closes at 900,00.
// Which of the two the card names is the behaviour under test.
export const FIRST_RED_HOLE = "R$ 340,00";
export const DEEPEST_RED_HOLE = "R$ 900,00";

// Months are seeded relative to the clock, never hardcoded: the dashboard
// answers "out_of_range" the moment the current month falls outside the derived
// range, so a fixed fixture would quietly stop rendering a card at all once the
// calendar passed it. Local date maths rather than an import from `src/` — this
// suite drives the app from outside and owns no app code.
const now = new Date();
const CURRENT = now.getFullYear() * 100 + now.getMonth() + 1;
const shift = (value: number, count: number) => {
  const index = Math.floor(value / 100) * 12 + (value % 100) - 1 + count;
  return Math.floor(index / 12) * 100 + (index % 12) + 1;
};

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

const income = (name: string, valueCents: number, month: number, id: string) =>
  post("/api/movements", {
    name,
    valueCents,
    type: "income",
    month,
    ownerId: id,
  });

const expense = (name: string, valueCents: number, month: number, id: string) =>
  post("/api/movements", {
    name,
    valueCents,
    type: "expense",
    month,
    ownerId: id,
  });

// Same lock as seed.helper's: Person.name is the only @unique column, so
// whoever creates CEILING_PERSON writes the rows and everyone else waits on the
// last movement written.
export async function seedCeiling() {
  const owner = await post("/api/people", {
    name: CEILING_PERSON,
    color: "violet",
  });
  if (!owner) return waitFor("/api/movements", "vermelho C");

  // Cumulative 1.000 / 1.200 / 1.500, then flat to the range end — a rising
  // shape, so the old suffix-minimum and the ratio disagree loudly.
  await income("teto A", 100000, CURRENT, owner.id);
  await income("teto B", 20000, shift(CURRENT, 1), owner.id);
  await income("teto C", 30000, shift(CURRENT, 2), owner.id);

  const red = await post("/api/people", { name: RED_PERSON, color: "red" });
  await income("vermelho A", 50000, CURRENT, red.id);
  await expense("vermelho B", 84000, shift(CURRENT, 1), red.id);
  await expense("vermelho C", 56000, shift(CURRENT, 2), red.id);
}
