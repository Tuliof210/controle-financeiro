// Not a spec — playwright only collects `*.spec.ts`. Fixture for the dashboard
// ceiling card, kept out of seed.helper.ts so the four row specs keep the exact
// data they were written against.

import { post, waitFor } from "./api.helper";

export const CEILING_PERSON = "Dona do Teto";
export const RED_PERSON = "Dono do Vermelho";
// A period whose balance DIPS and recovers. Its own first-month balance is
// 3.000, but the second month falls to 1.200 and that dip is what caps the first
// month — the one shape where "worst balance ahead" and "this month's own
// balance" are different numbers, and so the only shape that can tell the two
// formulas apart. The rising fixture above cannot: for it they are equal.
export const DIP_PERSON = "Dona da Queda";
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

const index = (yyyymm: number) =>
  Math.floor(yyyymm / 100) * 12 + (yyyymm % 100) - 1;

// "Ago/26". Month labels are spelled out rather than imported: this suite drives
// the app from outside and owns no app code.
export function monthLabel(yyyymm = CURRENT) {
  const labels = "Jan Fev Mar Abr Mai Jun Jul Ago Set Out Nov Dez".split(" ");
  return `${labels[(yyyymm % 100) - 1]}/${String(Math.trunc(yyyymm / 100) % 100).padStart(2, "0")}`;
}

// The chip beside the headline figure. Derived from fixture facts, never
// hardcoded: the
// range end is the shared seed's SPLIT_FORECAST reach (202611 — seed.helper.ts),
// and the count has to keep reading correctly whenever this runs, including
// November, the one month a year that exercises the singular branch.
export function monthsLeftLabel(rangeEnd = 202611) {
  const left = index(rangeEnd) - index(CURRENT) + 1;
  return left === 1 ? "1 mês restante" : `${left} meses restantes`;
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
  // The wait target is whatever this function writes LAST, so it moves whenever
  // a person is appended below.
  if (!owner) return waitFor("/api/movements", "queda C");

  // Cumulative 1.000 / 1.200 / 1.500, then flat to the range end — a rising
  // shape, so the old suffix-minimum and the ratio disagree loudly.
  await income("teto A", 100000, CURRENT, owner.id);
  await income("teto B", 20000, shift(CURRENT, 1), owner.id);
  await income("teto C", 30000, shift(CURRENT, 2), owner.id);

  const red = await post("/api/people", { name: RED_PERSON, color: "red" });
  await income("vermelho A", 50000, CURRENT, red.id);
  await expense("vermelho B", 84000, shift(CURRENT, 1), red.id);
  await expense("vermelho C", 56000, shift(CURRENT, 2), red.id);

  // Cumulative 3.000 / 1.200 / 10.000 — down then up, and never negative, so the
  // card still renders. The owner's own worked example, in cents.
  const dip = await post("/api/people", { name: DIP_PERSON, color: "amber" });
  await income("queda A", 3000, CURRENT, dip.id);
  await expense("queda B", 1800, shift(CURRENT, 1), dip.id);
  await income("queda C", 8800, shift(CURRENT, 2), dip.id);
}
