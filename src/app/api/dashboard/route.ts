import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { getDashboard } from "./service";

// The only GET in this API that takes a parameter, so it mirrors the DELETE
// handlers' searchParams read rather than the argument-less GETs. No Zod
// schema: `owner` is a single free-form string (a person id or the "familia"
// sentinel) and visibleFor already treats an unknown value as "matches
// nobody", so there is no shape to validate beyond non-empty.
export async function GET(request: NextRequest) {
  const owner = request.nextUrl.searchParams.get("owner");
  if (!owner) {
    return fail("Dados inválidos", "validation", 422);
  }

  try {
    return ok(await getDashboard(owner));
  } catch {
    return fail("Erro ao carregar dashboard", "internal", 500);
  }
}
