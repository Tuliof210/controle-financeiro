import { describe, expect, it } from "vitest";
import { buildMonths } from "@/lib/months";
import { useCoverageBar } from "./hook";

// useCoverageBar calls no React hook, so it runs as a plain function here — no
// renderer and no jsdom needed.
const RANGE = { start: 202601, end: 202612 };

describe("useCoverageBar", () => {
  it("draws no track at all when there is no global range", () => {
    const { segments, label } = useCoverageBar({
      months: buildMonths(202601, 202603),
      period: null,
    });
    expect(segments).toBeNull();
    expect(label).toBe("Jan/26–Mar/26");
  });

  it("fills the whole track for a recurrence spanning the range", () => {
    expect(
      useCoverageBar({ months: buildMonths(202601, 202612), period: RANGE })
        .segments,
    ).toEqual([{ left: "0%", width: "100%" }]);
  });

  it("draws an empty track for a recurrence entirely outside the range", () => {
    const { segments, label } = useCoverageBar({
      months: buildMonths(202701, 202703),
      period: RANGE,
    });
    expect(segments).toEqual([]);
    expect(label).toBe("Jan/27–Mar/27");
  });

  it("draws one segment per interval, matching the label's own gap", () => {
    const { segments, label } = useCoverageBar({
      months: [...buildMonths(202601, 202603), 202612],
      period: RANGE,
    });
    expect(segments).toEqual([
      { left: "0%", width: "25%" },
      { left: "91.6667%", width: "8.3333%" },
    ]);
    expect(label).toBe("Jan/26–Mar/26 · Dez/26");
  });

  it("names the bar after the same interval text shown beside it", () => {
    const { srLabel } = useCoverageBar({ months: [202605], period: RANGE });
    expect(srLabel).toBe("Vigência: Mai/26");
  });
});
