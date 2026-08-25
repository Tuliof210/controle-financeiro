import type { NextRequest } from "next/server";
import { fail, INTERNAL, ok, UNPROCESSABLE } from "@/lib/http.ts";
import { getDashboard } from "./service.ts";

// `owner` is the only input, and it is not validated: it is a single free-form
// string (a person id or the "familia" sentinel) that visibleFor already reads
// as "matches nobody" when unknown, so there is no shape to check beyond
// non-empty.
//
// Nothing else is read off the query string any more. The board has no controls
// of its own — the ceiling target, the goals target and whether simulations
// count all come off the saved `Settings` row — so `?cap=` and `?simulation=`
// are gone rather than tolerated: the app is local, there is no other client,
// and an accepted-but-ignored parameter is a lie the next reader has to
// disprove.
export async function GET(request: NextRequest) {
  const owner = request.nextUrl.searchParams.get("owner");
  if (!owner) {
    return fail("Dados inválidos", "validation", UNPROCESSABLE);
  }

  try {
    return ok(await getDashboard(owner));
  } catch {
    return fail("Erro ao carregar dashboard", "internal", INTERNAL);
  }
}
