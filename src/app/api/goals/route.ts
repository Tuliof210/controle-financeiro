import type { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { fail, ok, safeJson } from "@/lib/http";
import { createGoal, deleteGoal, listGoals, updateGoal } from "./service";

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  targetCents: z.number().int().min(1),
});

const updateSchema = createSchema.extend({ id: z.string().min(1) });

export async function GET() {
  try {
    return ok(await listGoals());
  } catch {
    return fail("Erro ao carregar objetivos", "internal", 500);
  }
}

export async function POST(request: NextRequest) {
  const parsed = createSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    return fail("Dados inválidos", "validation", 422);
  }

  return ok(await createGoal(parsed.data), 201);
}

export async function PUT(request: NextRequest) {
  const parsed = updateSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    return fail("Dados inválidos", "validation", 422);
  }

  try {
    return ok(await updateGoal(parsed.data));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return fail("Objetivo não encontrado", "not_found", 404);
    }
    return fail("Erro ao atualizar objetivo", "internal", 500);
  }
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
