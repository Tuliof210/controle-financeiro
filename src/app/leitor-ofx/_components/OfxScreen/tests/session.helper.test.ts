import { describe, expect, it } from "@jest/globals";
import {
  parseSession,
  SESSION_KEY,
} from "@/app/leitor-ofx/_components/OfxScreen/session.helper.ts";

const report = { months: [], accounts: [], fileHash: "abc" };

describe("SESSION_KEY", () => {
  it("names the one key the screen caches under", () => {
    expect(SESSION_KEY).toBe("ofx-report");
  });
});

describe("parseSession", () => {
  it("reads a cached report back", () => {
    expect(parseSession(JSON.stringify(report))).toEqual(report);
  });

  it("reads nothing cached as absent", () => {
    expect(parseSession(null)).toBeNull();
    expect(parseSession("")).toBeNull();
  });

  it("reads unparseable storage as absent", () => {
    expect(parseSession("{")).toBeNull();
  });

  it("refuses a shape that is not a report", () => {
    expect(parseSession(JSON.stringify({ months: [] }))).toBeNull();
    expect(parseSession(JSON.stringify({ accounts: [] }))).toBeNull();
  });

  it("refuses a report cached before the hash existed", () => {
    expect(
      parseSession(JSON.stringify({ months: [], accounts: [] })),
    ).toBeNull();
  });
});
