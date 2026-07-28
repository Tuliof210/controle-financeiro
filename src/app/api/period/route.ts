import { fail, ok } from "@/lib/http";
import { getPeriod } from "./service";

export async function GET() {
  try {
    return ok(await getPeriod());
  } catch {
    return fail("Erro ao carregar período", "internal", 500);
  }
}
