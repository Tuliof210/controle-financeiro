import { describe, expect, it } from "@jest/globals";
import { tipFor } from "@/app/_components/DashboardScreen/components/BalanceLineChart/line-tip.helper.ts";

describe("tipFor", () => {
  it("lists both figures when the month has a teto", () => {
    const tip = tipFor(202_608, 8, "real", {
      cumulative: 5000,
      ceilingLeft: 3000,
    });

    expect(tip.title).toBe("Ago/26");
    expect(tip.rows).toHaveLength(2);
    expect(tip.rows[1]).toMatchObject({
      label: "se gastar o teto",
      value: "R$ 30,00",
    });
  });
});
