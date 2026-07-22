import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok, safeJson } from "@/lib/http";
import { getSettings, saveSettings } from "./service";

const yyyymm = z.number().int().min(190001).max(999912);

const putSchema = z
  .object({
    rangeStart: yyyymm.nullable().optional(),
    rangeEnd: yyyymm.nullable().optional(),
    monthlyGoalCents: z.number().int().min(0).nullable().optional(),
  })
  .refine(
    (s) =>
      s.rangeStart == null || s.rangeEnd == null || s.rangeEnd >= s.rangeStart,
    {
      message: "Fim não pode ser antes do Início",
      path: ["rangeEnd"],
    },
  );

export async function GET() {
  return ok(await getSettings());
}

export async function PUT(request: NextRequest) {
  const parsed = putSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos";
    return fail(message, "validation", 422);
  }

  return ok(await saveSettings(parsed.data));
}
