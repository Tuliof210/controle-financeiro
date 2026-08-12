import type { NextRequest } from "next/server";
import { z } from "zod";
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
import { movementRowSchema } from "@/lib/movement-schema.ts";
import { importOfx, isOfxImported } from "./service.ts";

// The reader spans at most MAX_SPAN = 240 months, each able to yield one
// income and one expense row.
const MAX_SPAN_MONTHS = 240;
const ROWS_PER_MONTH = 2;
const MAX_ROWS = MAX_SPAN_MONTHS * ROWS_PER_MONTH;
const FILE_NAME_MAX = 255;

const createSchema = z.object({
  // The reader's SHA-256, not a free-form label: a 64-char lowercase hex digest.
  fileHash: z.string().regex(/^[0-9a-f]{64}$/),
  fileName: z.string().trim().min(1).max(FILE_NAME_MAX),
  ownerId: z.string().min(1),
  // No body limit is configured for Route Handlers, so the cap lives here: the
  // OFX reader spans at most MAX_SPAN = 240 months, each able to yield one
  // income and one expense row.
  movements: z.array(movementRowSchema).min(1).max(MAX_ROWS),
});

async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get("hash");
  if (!hash) {
    return fail("Dados inválidos", "validation", UNPROCESSABLE);
  }

  try {
    return ok(await isOfxImported(hash));
  } catch {
    return fail("Erro ao consultar importações", "internal", INTERNAL);
  }
}

async function POST(request: NextRequest) {
  const parsed = createSchema.safeParse(await safeJson(request));
  if (!parsed.success) {
    return fail("Dados inválidos", "validation", UNPROCESSABLE);
  }

  try {
    const imported = await importOfx(parsed.data);
    if (imported === null) {
      return fail(
        "Este arquivo já foi importado",
        "already_imported",
        CONFLICT,
      );
    }
    return ok({ imported }, CREATED);
  } catch (error) {
    return fail(...refusal(error));
  }
}

// P2002 as well as the service's own lookup: two imports of the same file
// racing each other both pass the check, and only the unique index stops the
// second. P2003 is an ownerId naming nobody, matching /api/movements.
function refusal(error: unknown): [string, string, number] {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return ["Este arquivo já foi importado", "already_imported", CONFLICT];
    }
    if (error.code === "P2003") {
      return ["Pessoa não encontrada", "not_found", NOT_FOUND];
    }
  }
  return ["Erro ao importar o extrato", "internal", INTERNAL];
}

export { GET, POST };
