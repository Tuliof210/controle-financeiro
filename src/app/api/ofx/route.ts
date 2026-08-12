import type { NextRequest } from "next/server";
import {
  fail,
  ok,
  PAYLOAD_TOO_LARGE,
  safeFormData,
  UNPROCESSABLE,
} from "@/lib/http.ts";
import { type ReadOfxResult, readOfx } from "./service.ts";

// next.config.ts sets no body limit for Route Handlers, so the cap lives here.
// A year of OFX is tens of KB, so this is generous by a hundredfold.
const KILOBYTE = 1024;
const MEGABYTE = KILOBYTE * KILOBYTE;
const MAX_MEGABYTES = 5;
const MAX_BYTES = MAX_MEGABYTES * MEGABYTE;

// Both maps are keyed on the refusal statuses themselves, not on `string`: a
// status added to ReadOfxResult without an entry here becomes a compile error
// rather than an `undefined` that JSON.stringify drops, silently breaking the
// {error:{message,code}} envelope every other route upholds.
type Refusal = Exclude<ReadOfxResult["status"], "ok">;

const MESSAGES: Record<Refusal, string> = {
  notOfx: "Arquivo não parece ser um OFX.",
  cardOnly:
    "Este arquivo tem apenas fatura de cartão. O leitor processa extrato de conta corrente.",
  noStatement: "Nenhum extrato de conta corrente encontrado no arquivo.",
  empty: "Nenhuma transação encontrada no extrato.",
};

// The status is internal and camelCase because it is a TS identifier; the code
// that goes on the wire is snake_case like every other one this API emits
// (`not_found`, `too_large`, `already_imported`). The two are not the same
// string and this map is where they stop being confused for each other.
const CODES: Record<Refusal, string> = {
  notOfx: "not_ofx",
  cardOnly: "card_only",
  noStatement: "no_statement",
  empty: "empty",
};

// No Zod: the body is a file, not a JSON shape. The trust-boundary checks are
// the instanceof and the size guard below; past them it is a byte array the
// parser already treats as untrusted. Nothing here reaches the database.
export async function POST(request: NextRequest) {
  const form = await safeFormData(request);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return fail("Envie um arquivo OFX", "validation", UNPROCESSABLE);
  }
  if (file.size > MAX_BYTES) {
    return fail("Arquivo maior que 5 MB", "too_large", PAYLOAD_TOO_LARGE);
  }

  const result = readOfx(new Uint8Array(await file.arrayBuffer()), file.name);
  if (result.status === "ok") {
    return ok(result.report);
  }
  return fail(MESSAGES[result.status], CODES[result.status], UNPROCESSABLE);
}
