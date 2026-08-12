/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { prisma } from "@/infra/db/client.ts";
import { ofxImportRepository } from "@/infra/repositories/ofx-import.prisma.repository.ts";

jest.mock("@/infra/db/client.ts", () => ({
  prisma: {
    ofxImport: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const client = jest.mocked(prisma);

const movements = [
  {
    name: "Entradas",
    valueCents: 1000,
    type: "income" as const,
    month: 202_608,
    ownerId: "p1",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("findByHash", () => {
  it("looks the file up by its digest", async () => {
    client.ofxImport.findUnique.mockResolvedValue({ id: "i1" } as never);

    await expect(ofxImportRepository.findByHash("abc")).resolves.toEqual({
      id: "i1",
    });
    expect(client.ofxImport.findUnique).toHaveBeenCalledWith({
      where: { fileHash: "abc" },
    });
  });
});

describe("create", () => {
  it("writes the import record and its rows in one transaction", async () => {
    const tx = {
      ofxImport: { create: jest.fn() },
      movement: {
        createMany: jest.fn((_args: { data: unknown[] }) =>
          Promise.resolve({ count: 1 }),
        ),
      },
    };
    // Interactive form: hand the callback a stub transaction client.
    const run = client.$transaction as unknown as jest.Mock;
    run.mockImplementation((body: (t: unknown) => Promise<number>) => body(tx));

    await expect(
      ofxImportRepository.create({
        fileHash: "abc",
        fileName: "a.ofx",
        movements,
      }),
    ).resolves.toBe(1);

    expect(tx.ofxImport.create).toHaveBeenCalledWith({
      data: { fileHash: "abc", fileName: "a.ofx" },
    });
    expect(tx.movement.createMany).toHaveBeenCalledWith({ data: movements });
  });
});
