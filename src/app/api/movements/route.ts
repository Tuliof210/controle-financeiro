import type { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client.ts";
import { fail, ok, safeJson } from "@/lib/http.ts";
import { movementRowShape } from "@/lib/movement-schema.ts";
import {
  createMovement,
  deleteMovement,
  listMovements,
  updateMovement,
} from "./service.ts";

// One row's fields plus its own owner. /api/ofx-imports validates the same
// shape in bulk, with a single owner for the whole batch.
const movementShape = { ...movementRowShape, ownerId: z.string().min(1) };

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
