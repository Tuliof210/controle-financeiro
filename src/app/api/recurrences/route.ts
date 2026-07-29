import type { NextRequest } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { fail, ok, safeJson } from "@/lib/http";
import { createSchema, updateSchema } from "./recurrence-schema.helper";
import {
  createRecurrence,
  deleteRecurrence,
  listRecurrences,
  updateRecurrence,
} from "./service";

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
