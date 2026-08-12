import { describe, expect, it } from "@jest/globals";
import type { OfxAccount } from "@/app/api/ofx/types.ts";
import {
  accountLabel,
  finalBalance,
} from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/account.helper.ts";

const account = (
  accountId: string | null,
  balanceCents: number | null = null,
) => ({ accountId, balanceCents }) as OfxAccount;

describe("accountLabel", () => {
  it("names the single account", () => {
    expect(accountLabel([account("12345-6")])).toBe("12345-6");
  });

  it("counts the others so a multi-account file does not read as one", () => {
    expect(accountLabel([account("12345-6"), account("7")])).toBe("12345-6 +1");
  });

  it("walks past a first statement that omitted its id", () => {
    expect(accountLabel([account(null), account("7")])).toBe("7 +1");
  });

  it("falls back when no statement declared an id", () => {
    expect(accountLabel([account(null)])).toBe("—");
    expect(accountLabel([])).toBe("—");
  });
});

describe("finalBalance", () => {
  it("takes the last declared balance", () => {
    expect(finalBalance([account("1", 1000), account("2", 2500)])).toBe(
      "R$ 25,00",
    );
  });

  it("keeps a zero balance, which is a real one", () => {
    expect(finalBalance([account("1", 1000), account("2", 0)])).toBe("R$ 0,00");
  });

  it("walks back past an account that declared none", () => {
    expect(finalBalance([account("1", 1000), account("2", null)])).toBe(
      "R$ 10,00",
    );
  });

  it("falls back when nothing declared one", () => {
    expect(finalBalance([account("1")])).toBe("—");
  });
});
