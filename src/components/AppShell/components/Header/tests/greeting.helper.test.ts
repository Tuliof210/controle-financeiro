import { describe, expect, it } from "@jest/globals";
import { getGreeting } from "@/components/AppShell/components/Header/greeting.helper.ts";

const at = (hour: number) => new Date(2026, 7, 12, hour);

describe("getGreeting", () => {
  it("greets the morning before noon", () => {
    expect(getGreeting(at(0))).toBe("Bom dia");
    expect(getGreeting(at(11))).toBe("Bom dia");
  });

  it("greets the afternoon from noon to 18h", () => {
    expect(getGreeting(at(12))).toBe("Boa tarde");
    expect(getGreeting(at(17))).toBe("Boa tarde");
  });

  it("greets the evening from 18h", () => {
    expect(getGreeting(at(18))).toBe("Boa noite");
    expect(getGreeting(at(23))).toBe("Boa noite");
  });
});
