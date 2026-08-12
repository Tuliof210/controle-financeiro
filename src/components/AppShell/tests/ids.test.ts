import { describe, expect, it } from "@jest/globals";
import { SIDEBAR_ID } from "@/components/AppShell/ids.ts";

describe("SIDEBAR_ID", () => {
  it("is the one string Header's aria-controls and Aside's id share", () => {
    expect(SIDEBAR_ID).toBe("app-sidebar");
  });
});
