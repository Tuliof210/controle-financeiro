import type { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { fail, ok, safeJson } from "@/lib/http";
import { RECURRENCE_TYPES } from "@/lib/recurrence-types";
import {
  createRecurrence,
  deleteRecurrence,
  listRecurrences,
  updateRecurrence,
} from "./service";

const recurrenceShape = {
  name: z.string().trim().min(1).max(80),
  valueCents: z.number().int().min(1),
  type: z.enum(RECURRENCE_TYPES),
  ownerId: z.string().min(1),
  rangeStart: z.number().int().min(190001).max(999912),
  rangeEnd: z.number().int().min(190001).max(999912),
};

const validRange = (v: { rangeStart: number; rangeEnd: number }) =>
  v.rangeStart <= v.rangeEnd;
const rangeIssue = { message: "Período inválido", path: ["rangeEnd"] };

const createSchema = z.object(recurrenceShape).refine(validRange, rangeIssue);
const updateSchema = z
  .object({ ...recurrenceShape, id: z.string().min(1) })
  .refine(validRange, rangeIssue);

export async function GET() {
  try {
    return ok(await listRecurrences());
  } catch {
    return fail("Erro ao carregar recorrências", "internal", 500);
  }
}

export async function POST(request: NextRequest) {
  const parsed = createSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    return fail("Dados inválidos", "validation", 422);
  }

  try {
    return ok(await createRecurrence(parsed.data), 201);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return fail("Pessoa não encontrada", "not_found", 404);
    }
    throw error;
  }
}

export async function PUT(request: NextRequest) {
  const parsed = updateSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    return fail("Dados inválidos", "validation", 422);
  }

  try {
    return ok(await updateRecurrence(parsed.data));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return fail("Recorrência não encontrada", "not_found", 404);
      }
      if (error.code === "P2003") {
        return fail("Pessoa não encontrada", "not_found", 404);
      }
    }
    return fail("Erro ao atualizar recorrência", "internal", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return fail("Parâmetro id é obrigatório", "validation", 422);
  }

  try {
    await deleteRecurrence(id);
    return ok({ id });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return fail("Recorrência não encontrada", "not_found", 404);
    }
    throw error;
  }
}
