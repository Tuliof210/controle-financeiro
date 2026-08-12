import { describe, expect, it } from "@jest/globals";
import { heldFor } from "@/app/_components/DashboardScreen/dashboard-held.helper.ts";

describe("heldFor", () => {
  it("serves the payload back to the profile it was fetched for", () => {
    expect(heldFor({ owner: "p1", payload: "board" }, "p1")).toBe("board");
  });

  it("drops it the moment the profile changes", () => {
    expect(heldFor({ owner: "p1", payload: "board" }, "p2")).toBeNull();
  });

  it("holds nothing before the first payload lands", () => {
    expect(heldFor(null, "p1")).toBeNull();
  });
});
