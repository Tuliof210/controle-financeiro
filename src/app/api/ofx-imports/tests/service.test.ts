/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { importOfx, isOfxImported } from "@/app/api/ofx-imports/service.ts";
import { ofxImportRepository } from "@/infra/repositories/ofx-import.prisma.repository.ts";

jest.mock(
  "../../../../infra/repositories/ofx-import.prisma.repository.ts",
  () => ({
    ofxImportRepository: { findByHash: jest.fn(), create: jest.fn() },
  }),
);

const repository = jest.mocked(ofxImportRepository);

const input = {
  fileHash: "a".repeat(64),
  fileName: "extrato.ofx",
  ownerId: "p1",
  movements: [
    {
      name: "Entradas",
      valueCents: 1000,
      type: "income" as const,
      month: 202_608,
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("isOfxImported", () => {
  it("reports an unseen file as not imported", async () => {
    repository.findByHash.mockResolvedValue(null);

    await expect(isOfxImported("h")).resolves.toEqual({
      imported: false,
      importedAt: null,
    });
  });

  it("reports when the file is already on record", async () => {
    const importedAt = new Date(2026, 7, 12);
    repository.findByHash.mockResolvedValue({ importedAt } as never);

    await expect(isOfxImported("h")).resolves.toEqual({
      imported: true,
      importedAt,
    });
  });
});

describe("importOfx", () => {
  it("answers null when the file is already on record", async () => {
    repository.findByHash.mockResolvedValue({
      importedAt: new Date(),
    } as never);

    await expect(importOfx(input)).resolves.toBeNull();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("stamps the batch owner onto every row", async () => {
    repository.findByHash.mockResolvedValue(null);
    repository.create.mockResolvedValue(1);

    await expect(importOfx(input)).resolves.toBe(1);
    expect(repository.create).toHaveBeenCalledWith({
      fileHash: input.fileHash,
      fileName: input.fileName,
      movements: [{ ...input.movements[0], ownerId: "p1" }],
    });
  });
});
