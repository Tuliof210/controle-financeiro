import type { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { fail, ok, safeJson } from "@/lib/http";
import { PALETTE } from "@/lib/palette";
import {
  createPerson,
  deletePerson,
  listPeople,
  updatePerson,
} from "./service";

const createSchema = z.object({
  name: z.string().trim().min(1).max(60),
  color: z.enum(PALETTE),
});

const updateSchema = createSchema.extend({ id: z.string().min(1) });

export async function GET() {
  try {
    return ok(await listPeople());
  } catch {
    return fail("Erro ao carregar pessoas", "internal", 500);
  }
}

export async function POST(request: NextRequest) {
  const parsed = createSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    return fail("Dados inválidos", "validation", 422);
  }

  try {
    return ok(await createPerson(parsed.data), 201);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fail("Já existe uma pessoa com esse nome", "duplicate", 409);
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
    return ok(await updatePerson(parsed.data));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return fail("Já existe uma pessoa com esse nome", "duplicate", 409);
      }
      if (error.code === "P2025") {
        return fail("Pessoa não encontrada", "not_found", 404);
      }
    }
    return fail("Erro ao atualizar pessoa", "internal", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return fail("Parâmetro id é obrigatório", "validation", 422);
  }

  try {
    await deletePerson(id);
    return ok({ id });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return fail("Pessoa não encontrada", "not_found", 404);
    }
    throw error;
  }
}
