// Not a spec — playwright only collects `*.spec.ts`. The fixture for
// simulated.spec.ts, kept out of seed.helper.ts so the four row specs keep the
// exact data they were written against, and out of the spec so that file stays
// assertions and clears the 100-line cap.

import { post, waitFor } from "./api.helper";
import { seed } from "./seed.helper";

// Own people, not seed.helper.ts's fixtures: those rows are shared with the
// row-* specs and editing one from here would redden them. Two of them, because
// the form half creates rows through the UI and the board half asserts on
// figures those rows would move.
export const FORM_OWNER = "Simulacao Spec Owner";
export const BOARD_OWNER = "Simulacao Spec Board";
// Neither name may contain "simulado": the badge is matched by its own text.
export const SIM_NAME = "Carronovohipotetico";
export const REAL_NAME = "Aluguelrealdaspec";

// Relative to the clock, like ceiling.helper.ts's: the dashboard answers
// out_of_range the moment the current month leaves the derived range, so a
// hardcoded month would quietly stop rendering the card.
const now = new Date();
const CURRENT = now.getFullYear() * 100 + now.getMonth() + 1;

// Same lock as the other fixtures': Person.name is the only @unique column, so
// whoever creates BOARD_OWNER writes the rows and everyone else waits on the
// last one written.
export async function seedSimulation() {
  await seed();
  await post("/api/people", { name: FORM_OWNER, color: "cyan" });

  const board = await post("/api/people", { name: BOARD_OWNER, color: "lime" });
  if (!board) return waitFor("/api/forecasts", "gasto simulado");

  // Income real, expense simulated, both in the current month: on "real" the
  // board sees only the income, on "all" the expense eats into it. One month is
  // enough — the ceiling reads the worst balance ahead, and there is only one.
  await post("/api/movements", {
    name: "entrada real",
    valueCents: 1000000,
    type: "income",
    ownerId: board.id,
    month: CURRENT,
  });
  await post("/api/forecasts", {
    name: "gasto simulado",
    valueCents: 500000,
    type: "expense",
    ownerId: board.id,
    months: [CURRENT],
    simulated: true,
  });
}
