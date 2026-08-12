import type { NextRequest } from "next/server";
import { Prisma } from "@/generated/prisma/client.ts";
import {
  CONFLICT,
  CREATED,
  fail,
  INTERNAL,
  NOT_FOUND,
  ok,
  safeJson,
  UNPROCESSABLE,
} from "@/lib/http.ts";
import { createSchema, updateSchema } from "./schema.ts";
import {
  createPerson,
  deletePerson,
  listPeople,
  updatePerson,
} from "./service.ts";

export async function GET() {
  try {
    return ok(await listPeople());
  } catch {
    return fail("Erro ao carregar pessoas", "internal", INTERNAL);
  }
}

export async function POST(request: NextRequest) {
  const parsed = createSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    return fail("Dados inválidos", "validation", UNPROCESSABLE);
  }

  try {
    return ok(await createPerson(parsed.data), CREATED);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fail("Já existe uma pessoa com esse nome", "duplicate", CONFLICT);
    }
    throw error;
  }
}

export async function PUT(request: NextRequest) {
  const parsed = updateSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    return fail("Dados inválidos", "validation", UNPROCESSABLE);
  }

  try {
    return ok(await updatePerson(parsed.data));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return fail(
          "Já existe uma pessoa com esse nome",
          "duplicate",
          CONFLICT,
        );
      }
      if (error.code === "P2025") {
        return fail("Pessoa não encontrada", "not_found", NOT_FOUND);
      }
    }
    return fail("Erro ao atualizar pessoa", "internal", INTERNAL);
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return fail("Parâmetro id é obrigatório", "validation", UNPROCESSABLE);
  }

  try {
    await deletePerson(id);
    return ok({ id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return fail("Pessoa não encontrada", "not_found", NOT_FOUND);
      }
      if (error.code === "P2003") {
        return fail("Pessoa possui registros vinculados", "conflict", CONFLICT);
      }
    }
    throw error;
  }
}
