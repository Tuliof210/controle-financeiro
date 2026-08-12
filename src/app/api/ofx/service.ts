import { createHash } from "node:crypto";
import { decodeOfx } from "@/lib/decode.ts";
import { parseOfx } from "./parse.helper.ts";
import { buildReport } from "./report.helper.ts";
import type { OfxReport } from "./types.ts";

export type ReadOfxResult =
  | { status: "ok"; report: OfxReport }
  | { status: "notOfx" } // no <OFX at all — a PDF, a CSV, a truncated file
  | { status: "cardOnly" } // only <CCSTMTRS>: out of scope by decision
  | { status: "noStatement" } // an OFX, but no checking-account statement
  | { status: "empty" }; // a statement with zero usable transactions

// Pure, like getHealth: no repository, no Prisma, nothing persisted. The whole
// route is a function over the uploaded bytes — the digest below included, which
// is why it belongs here and not behind a database lookup.
export function readOfx(bytes: Uint8Array, fileName: string): ReadOfxResult {
  const text = decodeOfx(bytes);
  if (!text.includes("<OFX")) {
    return { status: "notOfx" };
  }

  const parse = parseOfx(text);
  if (parse.statements.length === 0) {
    if (parse.cardBlocks > 0) {
      return { status: "cardOnly" };
    }
    return { status: "noStatement" };
  }

  // Over the RAW bytes, not the decoded text: decodeOfx normalises encodings,
  // so hashing its output would give two differently-encoded files — or the
  // same file read twice through a different branch — the same identity.
  const fileHash = createHash("sha256").update(bytes).digest("hex");
  const report = buildReport(parse, fileName, fileHash);
  // A statement whose every row is zero renders a table that answers nothing —
  // "empty" is the honest response, not a valid report.
  if (report.totals.count === 0) {
    return { status: "empty" };
  }
  return { status: "ok", report };
}
