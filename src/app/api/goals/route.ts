import type { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { fail, ok, safeJson } from "@/lib/http";
import { createGoal, deleteGoal, listGoals } from "./service";

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  targetCents: z.number().int().min(1),
});

export async function GET() {
  return ok(await listGoals());
}

export async function POST(request: NextRequest) {
  const parsed = createSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    return fail("Dados inválidos", "validation", 422);
  }

  return ok(await createGoal(parsed.data), 201);
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return fail("Parâmetro id é obrigatório", "validation", 422);
  }

  try {
    await deleteGoal(id);
    return ok({ id });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return fail("Objetivo não encontrado", "not_found", 404);
    }
    throw error;
  }
}
