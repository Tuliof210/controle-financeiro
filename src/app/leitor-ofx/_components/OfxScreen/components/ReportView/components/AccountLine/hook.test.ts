import { describe, expect, it } from "vitest";
import type { OfxAccount } from "@/app/api/ofx/types";
import { useAccountLine } from "./hook";

const account = (over: Partial<OfxAccount> = {}): OfxAccount => ({
  bankId: "001",
  accountId: "12345-6",
  accountType: "CHECKING",
  balanceCents: 149975,
  balanceMonth: 202602,
  start: 202601,
  end: 202602,
  ...over,
});

describe("useAccountLine", () => {
  it("reads as one sentence when the bank sent everything", () => {
    expect(useAccountLine({ account: account() }).text).toBe(
      "banco 001 · conta 12345-6 · CHECKING · saldo R$ 1.499,75 em Fev/26",
    );
  });

  it("drops the segments the export omitted instead of showing a dash", () => {
    expect(
      useAccountLine({ account: account({ bankId: null, accountType: null }) })
        .text,
    ).toBe("conta 12345-6 · saldo R$ 1.499,75 em Fev/26");
  });

  it("drops the balance clause entirely when there is no ledger balance", () => {
    expect(
      useAccountLine({ account: account({ balanceCents: null }) }).text,
    ).toBe("banco 001 · conta 12345-6 · CHECKING");
  });

  it("keeps the balance when only its date is missing", () => {
    expect(
      useAccountLine({ account: account({ balanceMonth: null }) }).text,
    ).toBe("banco 001 · conta 12345-6 · CHECKING · saldo R$ 1.499,75");
  });

  // An account block with nothing usable still has to render a row, or the
  // header would silently list fewer accounts than the file holds.
  it("never renders an empty line", () => {
    const empty = account({
      bankId: null,
      accountId: null,
      accountType: null,
      balanceCents: null,
    });
    expect(useAccountLine({ account: empty }).text).toBe(
      "Conta sem identificação",
    );
  });
});
