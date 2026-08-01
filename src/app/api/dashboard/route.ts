import type { NextRequest } from "next/server";
import { z } from "zod";
import { CEILING_CAPS, DEFAULT_CEILING_CAP } from "@/lib/ceiling-caps";
import { fail, ok } from "@/lib/http";
import { DEFAULT_SIMULATION_VIEW, SIMULATION_VIEWS } from "@/lib/simulation";
import { getDashboard } from "./service";

// `cap` is validated and `owner` is not, and the asymmetry is the point. `owner`
// is a single free-form string (a person id or the "familia" sentinel) that
// visibleFor already reads as "matches nobody" when unknown, so there is no
// shape to check beyond non-empty. `cap` is a closed set feeding integer
// arithmetic: `?cap=abc` would put NaN through every budget, every pace and
// every goal date in the payload.
//
// `.catch` and not `safeParse` + 422: this value is set by our own selector, and
// `src/lib/api.ts` renders any error envelope as the screen's red notice — a
// typo in a hand-edited URL would look exactly like an outage. An unusable cap
// falls back to the default the selector itself starts on.
const capSchema = z
  .enum(CEILING_CAPS)
  .catch(DEFAULT_CEILING_CAP)
  .transform(Number);

// Same closed set, same selector, so the same `.catch` reasoning applies —
// including the absent case, which is every caller written before simulations
// existed and must keep meaning "real only".
const simulationSchema = z
  .enum(SIMULATION_VIEWS)
  .catch(DEFAULT_SIMULATION_VIEW);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const owner = params.get("owner");
  if (!owner) {
    return fail("Dados inválidos", "validation", 422);
  }

  try {
    return ok(
      await getDashboard(
        owner,
        capSchema.parse(params.get("cap")),
        simulationSchema.parse(params.get("simulation")),
      ),
    );
  } catch {
    return fail("Erro ao carregar dashboard", "internal", 500);
  }
}
