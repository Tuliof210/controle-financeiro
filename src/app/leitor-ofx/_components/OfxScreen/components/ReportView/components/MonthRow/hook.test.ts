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

describe("useMonthRow — what the copy buttons carry", () => {
  // The whole point of the screen: this string is pasted into a MoneyInput,
  // which runs it through digitsToCents. Grouped or signed forms would need
  // editing first, so the display value is deliberately NOT what is copied.
  it("copies the paste-ready form, not the displayed one", () => {
    const jan = row();
    expect(jan.copyIncome).toBe("4312,50");
    expect(jan.copyExpense).toBe("2890,00");
    expect(jan.income).toBe("R$ 4.312,50");
  });

  it("names each button after its own row and column", () => {
    expect(row()).toMatchObject({
      copyIncomeLabel: "Copiar entradas de Jan/26",
      copyExpenseLabel: "Copiar saídas de Jan/26",
    });
  });

  // The table is zero-filled by design; a button offering "0,00" is noise.
  it("offers no button for a value of zero", () => {
    const empty = row({ incomeCents: 0, expenseCents: 0 });
    expect(empty.copyIncome).toBeNull();
    expect(empty.copyExpense).toBeNull();
  });

  it("still offers the other button when only one side is zero", () => {
    const inflowOnly = row({ expenseCents: 0 });
    expect(inflowOnly.copyIncome).toBe("4312,50");
    expect(inflowOnly.copyExpense).toBeNull();
  });
});
