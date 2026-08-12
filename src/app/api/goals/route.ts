import type { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client.ts";
import {
  CREATED,
  fail,
  INTERNAL,
  NOT_FOUND,
  ok,
  safeJson,
  UNPROCESSABLE,
} from "@/lib/http.ts";
import { createGoal, deleteGoal, listGoals, updateGoal } from "./service.ts";

const NAME_MAX = 80;

const createSchema = z.object({
  name: z.string().trim().min(1).max(NAME_MAX),
  targetCents: z.number().int().min(1),
});

const updateSchema = createSchema.extend({ id: z.string().min(1) });

export async function GET() {
  try {
    return ok(await listGoals());
  } catch {
    return fail("Erro ao carregar objetivos", "internal", INTERNAL);
  }
}

export async function POST(request: NextRequest) {
  const parsed = createSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    return fail("Dados inválidos", "validation", UNPROCESSABLE);
  }

  return ok(await createGoal(parsed.data), CREATED);
}

export async function PUT(request: NextRequest) {
  const parsed = updateSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    return fail("Dados inválidos", "validation", UNPROCESSABLE);
  }

  try {
    return ok(await updateGoal(parsed.data));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return fail("Objetivo não encontrado", "not_found", NOT_FOUND);
    }
    return fail("Erro ao atualizar objetivo", "internal", INTERNAL);
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return fail("Parâmetro id é obrigatório", "validation", UNPROCESSABLE);
  }

  try {
    await deleteGoal(id);
    return ok({ id });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return fail("Objetivo não encontrado", "not_found", NOT_FOUND);
    }
    throw error;
  }
}
