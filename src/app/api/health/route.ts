import { NextResponse } from "next/server";
import { getHealth } from "./service";

export function GET() {
  return NextResponse.json({ data: getHealth() });
}
