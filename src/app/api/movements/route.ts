import type { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { fail, ok, safeJson } from "@/lib/http";
import { MOVEMENT_TYPES } from "@/lib/movement-types";
import {
  createMovement,
  deleteMovement,
  listMovements,
  updateMovement,
} from "./service";

const movementShape = {
  name: z.string().trim().min(1).max(80),
  valueCents: z.number().int().min(1),
  type: z.enum(MOVEMENT_TYPES),
  ownerId: z.string().min(1),
  month: z.number().int().min(190001).max(999912),
};

const createSchema = z.object(movementShape);
const updateSchema = z.object({ ...movementShape, id: z.string().min(1) });

export async function GET() {
  try {
    return ok(await listMovements());
  } catch {
    return fail("Erro ao carregar movimentações", "internal", 500);
  }
}

export async function POST(request: NextRequest) {
  const parsed = createSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    return fail("Dados inválidos", "validation", 422);
  }

  try {
    return ok(await createMovement(parsed.data), 201);
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
    return ok(await updateMovement(parsed.data));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return fail("Movimentação não encontrada", "not_found", 404);
      }
      if (error.code === "P2003") {
        return fail("Pessoa não encontrada", "not_found", 404);
      }
    }
    return fail("Erro ao atualizar movimentação", "internal", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return fail("Parâmetro id é obrigatório", "validation", 422);
  }

  try {
    await deleteMovement(id);
    return ok({ id });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return fail("Movimentação não encontrada", "not_found", 404);
    }
    throw error;
  }
}
