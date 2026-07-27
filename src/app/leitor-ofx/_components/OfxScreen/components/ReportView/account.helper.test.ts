import { describe, expect, it } from "vitest";
import type { OfxAccount } from "@/app/api/ofx/types";
import { accountLabel, finalBalance } from "./account.helper";

const account = (over: Partial<OfxAccount> = {}): OfxAccount => ({
  bankId: "001",
  accountId: "12345-6",
  accountType: "CHECKING",
  balanceCents: 149975,
  balanceMonth: 202602,
  start: null,
  end: null,
  ...over,
});

describe("accountLabel", () => {
  it("names the first account", () => {
    expect(accountLabel([account()])).toBe("12345-6");
  });

  // The metadata row shows one account; the count is what stops the other two
  // from being hidden entirely.
  it("counts the accounts it does not name", () => {
    const many = [account(), account({ accountId: "999" }), account()];
    expect(accountLabel(many)).toBe("12345-6 +2");
  });

  // Every OfxAccount field is nullable, so a file naming no account must not
  // print "undefined" under CONTA.
  it("falls back when there is no account, or none with an id", () => {
    expect(accountLabel([])).toBe("—");
    expect(accountLabel([account({ accountId: null })])).toBe("—");
  });
});

describe("finalBalance", () => {
  it("formats the declared balance as money", () => {
    expect(finalBalance([account()])).toBe("R$ 1.499,75");
  });

  // Not "the last account's balance" — the last account may declare none.
  it("takes the last account that actually declared one", () => {
    const many = [
      account(),
      account({ balanceCents: 5000 }),
      account({ balanceCents: null }),
    ];
    expect(finalBalance(many)).toBe("R$ 50,00");
  });

  it("falls back when no account declares a balance at all", () => {
    expect(finalBalance([])).toBe("—");
    expect(finalBalance([account({ balanceCents: null })])).toBe("—");
  });

  // A zero balance is a declared balance: `?? ` and not `||`, or an account
  // that really is at zero silently reads as one that declared nothing.
  it("prints a zero balance rather than reading it as absent", () => {
    expect(finalBalance([account({ balanceCents: 0 })])).toBe("R$ 0,00");
  });

  it("keeps a negative balance signed", () => {
    expect(finalBalance([account({ balanceCents: -45025 })])).toBe(
      "−R$ 450,25",
    );
  });
});
