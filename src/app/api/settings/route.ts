import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok, safeJson } from "@/lib/http";
import { getSettings, saveSettings } from "./service";

const putSchema = z.object({
  monthlyGoalCents: z.number().int().min(0).nullable().optional(),
});

export async function GET() {
  try {
    return ok(await getSettings());
  } catch {
    return fail("Erro ao carregar configurações", "internal", 500);
  }
}

export async function PUT(request: NextRequest) {
  const parsed = putSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos";
    return fail(message, "validation", 422);
  }

  return ok(await saveSettings(parsed.data));
}
