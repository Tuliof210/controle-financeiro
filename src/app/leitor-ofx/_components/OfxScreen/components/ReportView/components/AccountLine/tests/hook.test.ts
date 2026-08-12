import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import type { OfxAccount } from "@/app/api/ofx/types.ts";
import { useAccountLine } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/AccountLine/hook.ts";

// Every field spelled out: the helper branches on `null`, and an absent key
// would read as `undefined` and slip past those guards.
const EMPTY: OfxAccount = {
  bankId: null,
  accountId: null,
  accountType: null,
  balanceCents: null,
  balanceMonth: null,
  start: null,
  end: null,
};

const line = (account: Partial<OfxAccount>) =>
  renderHook(() => useAccountLine({ account: { ...EMPTY, ...account } })).result
    .current.text;

describe("useAccountLine", () => {
  it("reads as one sentence when the bank sent everything", () => {
    expect(
      line({
        bankId: "001",
        accountId: "12345-6",
        accountType: "CHECKING",
        balanceCents: 50_000,
        balanceMonth: 202_608,
      }),
    ).toBe("banco 001 · conta 12345-6 · CHECKING · saldo R$ 500,00 em Ago/26");
  });

  it("drops the month when the balance is undated", () => {
    expect(line({ bankId: "001", balanceCents: 50_000 })).toBe(
      "banco 001 · saldo R$ 500,00",
    );
  });

  it("drops the balance segment entirely when there is none", () => {
    expect(line({ bankId: "001", accountId: "7" })).toBe("banco 001 · conta 7");
  });

  it("falls back when the export identified nothing at all", () => {
    expect(line({})).toBe("Conta sem identificação");
  });
});
