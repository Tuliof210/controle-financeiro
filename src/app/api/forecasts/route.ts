import type { NextRequest } from "next/server";
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
import { createSchema, updateSchema } from "./schema.ts";
import {
  createForecast,
  deleteForecast,
  listForecasts,
  updateForecast,
} from "./service.ts";

export async function GET() {
  try {
    return ok(await listForecasts());
  } catch {
    return fail("Erro ao carregar previsões", "internal", INTERNAL);
  }
}

export async function POST(request: NextRequest) {
  const parsed = createSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    return fail("Dados inválidos", "validation", UNPROCESSABLE);
  }

  try {
    return ok(await createForecast(parsed.data), CREATED);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return fail("Pessoa não encontrada", "not_found", NOT_FOUND);
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
    return ok(await updateForecast(parsed.data));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return fail("Previsão não encontrada", "not_found", NOT_FOUND);
      }
      if (error.code === "P2003") {
        return fail("Pessoa não encontrada", "not_found", NOT_FOUND);
      }
    }
    return fail("Erro ao atualizar previsão", "internal", INTERNAL);
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return fail("Parâmetro id é obrigatório", "validation", UNPROCESSABLE);
  }

  try {
    await deleteForecast(id);
    return ok({ id });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return fail("Previsão não encontrada", "not_found", NOT_FOUND);
    }
    throw error;
  }
}
