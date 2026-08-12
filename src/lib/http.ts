import { NextResponse } from "next/server";

export const ok = <T>(data: T, status = 200) =>
  NextResponse.json({ data }, { status });

export const fail = (message: string, code: string, status = 400) =>
  NextResponse.json({ error: { message, code } }, { status });

// request.json() throws SyntaxError on empty/malformed bodies, before any
// Zod schema runs — swallow that here so callers always reach safeParse.
export async function safeJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    // Undefined on a malformed body: the caller's Zod schema rejects it.
  }
}

// Same trust boundary as safeJson: request.formData() throws on a malformed or
// absent multipart body, before any validation runs.
export async function safeFormData(
  request: Request,
): Promise<FormData | undefined> {
  try {
    return await request.formData();
  } catch {
    // Undefined on a malformed body: the caller checks before using it.
  }
}

// The status codes the routes hand `fail`/`ok`. Named because a bare 422 in a
// handler is exactly the magic number the linter is right about: `CONFLICT`
// says why the request failed, `409` only says how it is spelled on the wire.
export const CREATED = 201;
export const NOT_FOUND = 404;
export const CONFLICT = 409;
export const PAYLOAD_TOO_LARGE = 413;
export const UNPROCESSABLE = 422;
export const INTERNAL = 500;
