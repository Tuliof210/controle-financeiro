import { fail, INTERNAL, ok } from "@/lib/http.ts";
import { getPeriod } from "./service.ts";

export async function GET() {
  try {
    return ok(await getPeriod());
  } catch {
    return fail("Erro ao carregar período", "internal", INTERNAL);
  }
}
