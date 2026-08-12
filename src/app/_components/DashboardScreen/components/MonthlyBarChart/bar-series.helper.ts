import type { MonthPoint } from "@/app/api/dashboard/types.ts";

// Each series reads its own "is this month a projection" flag.
function estimatedFor(point: MonthPoint, key: "income" | "expense"): boolean {
  if (key === "income") {
    return point.incomeEstimated;
  }
  return point.expenseEstimated;
}

// The wash behind the projected months, or nothing when none are projected.
function bandOf(bandStart: number | null, innerWidth: number) {
  if (bandStart === null) {
    return null;
  }
  return { x: bandStart, width: Math.max(0, innerWidth - bandStart) };
}

export { bandOf, estimatedFor };
