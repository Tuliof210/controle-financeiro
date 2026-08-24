import { describe, expect, it } from "@jest/globals";
import type { DashboardData } from "@/app/api/dashboard/types.ts";
import {
  formatSeenLine,
  parseSeen,
  type SeenSnapshot,
  snapshotFrom,
} from "@/app/_components/DashboardScreen/seen.helper.ts";

const snap = (over: Partial<SeenSnapshot> = {}): SeenSnapshot => ({
  owner: "familia",
  monthlyCents: 250,
  projectedEndCents: 600,
  ...over,
});

const ok = (monthly: number, cumulative: number) =>
  ({
    status: "ok",
    ceiling: { monthly },
    points: [{ month: 202_608, cumulative }],
  }) as DashboardData;

describe("snapshotFrom", () => {
  it("reads monthly ceiling and the last projected balance", () => {
    expect(snapshotFrom(ok(250, 600), "familia")).toEqual(snap());
  });

  it("returns nothing when the payload is not ok", () => {
    expect(snapshotFrom({ status: "no_range" }, "familia")).toBeUndefined();
  });
});

describe("parseSeen", () => {
  it("accepts a well-formed snapshot", () => {
    expect(parseSeen(JSON.stringify(snap()))).toEqual(snap());
  });

  it("rejects junk", () => {
    expect(parseSeen("{")).toBeUndefined();
    expect(parseSeen(JSON.stringify({ owner: "familia" }))).toBeUndefined();
  });
});

describe("formatSeenLine", () => {
  it("is silent on a first visit or a different owner", () => {
    expect(formatSeenLine(undefined, snap())).toBeUndefined();
    expect(formatSeenLine(snap({ owner: "p1" }), snap())).toBeUndefined();
  });

  it("names a monthly ceiling change", () => {
    expect(formatSeenLine(snap(), snap({ monthlyCents: 100 }))).toBe(
      "Teto do mês: R$ 2,50 → R$ 1,00.",
    );
  });

  it("names a projected-end change", () => {
    expect(formatSeenLine(snap(), snap({ projectedEndCents: 400 }))).toBe(
      "Saldo projetado: R$ 6,00 → R$ 4,00.",
    );
  });

  it("is silent when both figures match", () => {
    expect(formatSeenLine(snap(), snap())).toBeUndefined();
  });
});
