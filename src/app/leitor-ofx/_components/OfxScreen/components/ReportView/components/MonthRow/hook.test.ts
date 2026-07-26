import { describe, expect, it } from "vitest";
import type { OfxMonth } from "@/app/api/ofx/types";
import { useMonthRow } from "./hook";

// No React hook is called in here, so it runs as a plain function.
const row = (over: Partial<OfxMonth> = {}) =>
  useMonthRow({
    month: {
      month: 202601,
      incomeCents: 431250,
      expenseCents: 289000,
      balanceCents: 142250,
      count: 12,
      ...over,
    },
  });

describe("useMonthRow", () => {
  it("formats the month and every money cell for display", () => {
    expect(row()).toMatchObject({
      label: "Jan/26",
      income: "R$ 4.312,50",
      expense: "R$ 2.890,00",
      balance: "R$ 1.422,50",
      count: 12,
      negative: false,
    });
  });

  // U+2212 MINUS, not an ASCII hyphen — formatMoney's own convention, and the
  // reason `negative` only tints a sign the text already carries.
  it("marks a month that spent more than it took in", () => {
    const negative = row({ balanceCents: -105000 });
    expect(negative.balance).toBe("−R$ 1.050,00");
    expect(negative.negative).toBe(true);
  });

  it("renders a zero-filled month as zeros, not as blanks", () => {
    expect(
      row({ incomeCents: 0, expenseCents: 0, balanceCents: 0, count: 0 }),
    ).toMatchObject({
      income: "R$ 0,00",
      expense: "R$ 0,00",
      balance: "R$ 0,00",
      count: 0,
      negative: false,
    });
  });
});
