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
    return;
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
    return;
  }
}
