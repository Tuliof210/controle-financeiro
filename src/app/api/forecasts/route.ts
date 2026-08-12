import type { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client.ts";
import { ENTRY_TYPES } from "@/lib/entry-types.ts";
import { fail, ok, safeJson } from "@/lib/http.ts";
import {
  createForecast,
  deleteForecast,
  listForecasts,
  updateForecast,
} from "./service.ts";

const forecastShape = {
  name: z.string().trim().min(1).max(80),
  valueCents: z.number().int().min(1),
  type: z.enum(ENTRY_TYPES),
  ownerId: z.string().min(1),
  // At least one active month; deduped and sorted so storage is canonical.
  // 2000-2099: the picker's own domain — the derived period feeds
  // buildMonths, so a wider bound risks a corrupt row enumerating ~950k rows.
  months: z
    .array(z.number().int().min(200001).max(209912))
    .min(1)
    .transform((m) => [...new Set(m)].sort((a, b) => a - b)),
  // Defaulted rather than required: a body that predates simulations — the e2e
  // seeds, a saved curl — is a real forecast, not a validation error.
  simulated: z.boolean().default(false),
};

const createSchema = z.object(forecastShape);
const updateSchema = z.object({ ...forecastShape, id: z.string().min(1) });

export async function GET() {
  try {
    return ok(await listForecasts());
  } catch {
    return fail("Erro ao carregar previsões", "internal", 500);
  }
}

export async function POST(request: NextRequest) {
  const parsed = createSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    return fail("Dados inválidos", "validation", 422);
  }

  try {
    return ok(await createForecast(parsed.data), 201);
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
    return ok(await updateForecast(parsed.data));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return fail("Previsão não encontrada", "not_found", 404);
      }
      if (error.code === "P2003") {
        return fail("Pessoa não encontrada", "not_found", 404);
      }
    }
    return fail("Erro ao atualizar previsão", "internal", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return fail("Parâmetro id é obrigatório", "validation", 422);
  }

  try {
    await deleteForecast(id);
    return ok({ id });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return fail("Previsão não encontrada", "not_found", 404);
    }
    throw error;
  }
}
