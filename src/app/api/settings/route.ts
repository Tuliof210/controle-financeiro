import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok, safeJson } from "@/lib/http";
import { MAX_CENTS } from "@/lib/money";
import { getSettings, saveSettings } from "./service";

// `min(0)` and not `min(1)` like a Goal's target: zero is how the owner CLEARS
// the goal. There is no DELETE here, because "no goal" and "a goal of nothing"
// are the same state to the Meta target, and one write is a shorter path than
// two endpoints. `max` is MoneyInput's own ceiling — the field cannot type a
// larger number, so a larger one arrived from somewhere else.
const saveSchema = z.object({
  monthlyGoalCents: z.number().int().min(0).max(MAX_CENTS),
});

// `null` when nothing was ever saved, which is a legitimate answer and not a
// 404: the singleton's absence IS the "no goal set" state every reader wants.
export async function GET() {
  try {
    return ok(await getSettings());
  } catch {
    return fail("Erro ao carregar configurações", "internal", 500);
  }
}

export async function PUT(request: NextRequest) {
  const parsed = saveSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    return fail("Dados inválidos", "validation", 422);
  }
  try {
    return ok(await saveSettings(parsed.data));
  } catch {
    return fail("Erro ao salvar configurações", "internal", 500);
  }
}
