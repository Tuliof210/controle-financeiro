import { NextResponse } from "next/server";
import { getHealth } from "./service.ts";

export function GET() {
  return NextResponse.json({ data: getHealth() });
}
