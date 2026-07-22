import { NextResponse } from "next/server";

export const ok = <T>(data: T, status = 200) =>
  NextResponse.json({ data }, { status });

export const fail = (message: string, code: string, status = 400) =>
  NextResponse.json({ error: { message, code } }, { status });
