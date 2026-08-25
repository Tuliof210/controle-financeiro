import type { NextRequest } from "next/server";
import { z } from "zod";
import { SETTING_MODES } from "@/core/entities/settings.entity.ts";
import { fail, INTERNAL, ok, safeJson, UNPROCESSABLE } from "@/lib/http.ts";
import { MAX_CENTS } from "@/lib/money.ts";
import { getSettings, saveSettings } from "./service.ts";

// `min(0)` and not `min(1)` like a Goal's target: zero is how the owner CLEARS
// an adjustment. There is no DELETE here, because "no ceiling" and "a ceiling
// of nothing" are the same state to the reader, and one write is a shorter path
// than two endpoints. `max` is Field money's own ceiling — the field cannot type
// a larger number, so a larger one arrived from somewhere else.
const cents = z.number().int().min(0).max(MAX_CENTS);

// A share of what is available, so the whole range and nothing outside it.
const WHOLE = 100;
const percent = z.number().int().min(0).max(WHOLE);

// All seven, always: the PUT is all-or-nothing and `upsert` writes the seven,
// so a screen editing one card sends the other six back as they were.
const saveSchema = z.object({
  ceilingMode: z.enum(SETTING_MODES),
  ceilingPercent: percent,
  ceilingCents: cents,
  goalsMode: z.enum(SETTING_MODES),
  goalsPercent: percent,
  goalsCents: cents,
  showSimulated: z.boolean(),
});

// `null` when nothing was ever saved, which is a legitimate answer and not a
// 404: the singleton's absence IS the "nothing configured" state every reader
// wants, and DEFAULT_SETTINGS is what each of them applies to it.
export async function GET() {
  try {
    return ok(await getSettings());
  } catch {
    return fail("Erro ao carregar configurações", "internal", INTERNAL);
  }
}

export async function PUT(request: NextRequest) {
  const parsed = saveSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    return fail("Dados inválidos", "validation", UNPROCESSABLE);
  }
  try {
    return ok(await saveSettings(parsed.data));
  } catch {
    return fail("Erro ao salvar configurações", "internal", INTERNAL);
  }
}
