/**
 * @jest-environment node
 */
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";

// The one module that opens the SQLite file, so it is loaded through
// isolateModules with the client constructor stubbed — never against the
// owner's dev.db. What is worth asserting is the hot-reload cache: outside
// production the same instance is reused instead of one connection per edit.
const store = globalThis as unknown as { prisma?: unknown };

jest.mock("@prisma/adapter-better-sqlite3", () => ({
  PrismaBetterSqlite3: jest.fn(),
}));
jest.mock("@/generated/prisma/client.ts", () => ({
  PrismaClient: jest.fn(() => ({ tag: "client" })),
}));

const loadClient = async () => {
  let loaded: unknown;
  await jest.isolateModulesAsync(async () => {
    loaded = (await import("../client.ts")).prisma;
  });
  return loaded;
};

beforeEach(() => {
  store.prisma = undefined;
});

afterEach(() => {
  store.prisma = undefined;
});

describe("prisma", () => {
  it("builds the client from the adapter", async () => {
    await expect(loadClient()).resolves.toEqual({ tag: "client" });
  });

  it("caches it on globalThis so hot reload reuses one connection", async () => {
    const first = await loadClient();

    expect(store.prisma).toBe(first);
    await expect(loadClient()).resolves.toBe(first);
  });
});
