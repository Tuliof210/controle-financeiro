import { createHash } from "node:crypto";
import { decodeOfx } from "@/lib/decode";
import { parseOfx } from "./parse.helper";
import { buildReport } from "./report.helper";
import type { OfxReport } from "./types";

export type ReadOfxResult =
  | { status: "ok"; report: OfxReport }
  | { status: "not_ofx" } // no <OFX at all — a PDF, a CSV, a truncated file
  | { status: "card_only" } // only <CCSTMTRS>: out of scope by decision
  | { status: "no_statement" } // an OFX, but no checking-account statement
  | { status: "empty" }; // a statement with zero usable transactions

// Pure, like getHealth: no repository, no Prisma, nothing persisted. The whole
// route is a function over the uploaded bytes — the digest below included, which
// is why it belongs here and not behind a database lookup.
export function readOfx(bytes: Uint8Array, fileName: string): ReadOfxResult {
  const text = decodeOfx(bytes);
  if (!text.includes("<OFX")) {
    return { status: "not_ofx" };
  }

  const parse = parseOfx(text);
  if (parse.statements.length === 0) {
    return parse.cardBlocks > 0
      ? { status: "card_only" }
      : { status: "no_statement" };
  }

  // Over the RAW bytes, not the decoded text: decodeOfx normalises encodings,
  // so hashing its output would give two differently-encoded files — or the
  // same file read twice through a different branch — the same identity.
  const fileHash = createHash("sha256").update(bytes).digest("hex");
  const report = buildReport(parse, fileName, fileHash);
  // A statement whose every row is zero renders a table that answers nothing —
  // "empty" is the honest response, not a valid report.
  return report.totals.count === 0
    ? { status: "empty" }
    : { status: "ok", report };
}
