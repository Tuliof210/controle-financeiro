import { describe, expect, it } from "vitest";
import type { LimitMonth } from "@/app/api/dashboard/types";
import { useLimitCard } from "./hook";

const month = (percent: number | null, spent = 400000): LimitMonth => ({
  month: 202602,
  spent,
  percent,
});
const card = (goalCents: number | null, months: LimitMonth[] = [month(133)]) =>
  useLimitCard({ limit: { goalCents, months } });

describe("useLimitCard", () => {
  it("shows the list once a ceiling is saved", () => {
    const { empty, ceiling, rows } = card(300000);
    expect(empty).toBe(false);
    expect(ceiling).toBe("R$ 3.000,00");
    expect(rows[0]).toMatchObject({ percentText: "133%", tone: "negative" });
  });

  it("goes empty when no ceiling was ever saved", () => {
    expect(card(null, [month(null)]).empty).toBe(true);
  });

  it("treats a saved ceiling of zero as no ceiling", () => {
    // Reachable from the UI: MoneyInput seeds the field to 0 and Save does not
    // block it. The producer maps 0 to a null percent, so without this the card
    // would report R$ 4.000,00 spent as "▼ 0%" of a ceiling of nothing.
    expect(card(0, [month(null)]).empty).toBe(true);
  });

  it("keeps the true percentage in text, unclamped", () => {
    expect(card(300000, [month(240)]).rows[0].percentText).toBe("240%");
  });

  it("is positive at or under the ceiling and negative past it", () => {
    expect(card(300000, [month(100)]).rows[0].tone).toBe("positive");
    expect(card(300000, [month(101)]).rows[0].tone).toBe("negative");
  });

  it("names the row for screen readers, since the bar is a colour", () => {
    expect(card(300000, [month(133)]).rows[0].srLabel).toBe(
      "Fev/26: R$ 4.000,00, 133% da meta",
    );
  });
});
