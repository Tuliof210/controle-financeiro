/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/ofx-imports/route.ts";
import { importOfx } from "@/app/api/ofx-imports/service.ts";
import { Prisma } from "@/generated/prisma/client.ts";

jest.mock("../service.ts", () => ({
  isOfxImported: jest.fn(),
  importOfx: jest.fn(),
}));

const imported = jest.mocked(importOfx);

const valid = {
  fileHash: "a".repeat(64),
  fileName: "extrato.ofx",
  ownerId: "p1",
  movements: [
    { name: "Entradas", valueCents: 1000, type: "income", month: 202_608 },
  ],
};

const post = (body: unknown) =>
  POST(
    new NextRequest("http://x/api/ofx-imports", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );

const known = (code: string) =>
  new Prisma.PrismaClientKnownRequestError("boom", {
    code,
    clientVersion: "7",
  });

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST", () => {
  it("answers 201 with the row count", async () => {
    imported.mockResolvedValue(2);
    const res = await post(valid);

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ data: { imported: 2 } });
  });

  it("answers 422 on a hash that is not a SHA-256 digest", async () => {
    expect((await post({ ...valid, fileHash: "xyz" })).status).toBe(422);
    expect(imported).not.toHaveBeenCalled();
  });

  it("answers 422 on an empty batch", async () => {
    expect((await post({ ...valid, movements: [] })).status).toBe(422);
  });

  it("answers 409 when the service already has the file", async () => {
    imported.mockResolvedValue(null);
    const res = await post(valid);

    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({
      error: { code: "already_imported" },
    });
  });

  it("answers 409 when the unique index catches a race", async () => {
    imported.mockRejectedValue(known("P2002"));

    expect((await post(valid)).status).toBe(409);
  });

  it("answers 404 when the owner names nobody", async () => {
    imported.mockRejectedValue(known("P2003"));

    expect((await post(valid)).status).toBe(404);
  });

  it("answers 500 on anything else", async () => {
    imported.mockRejectedValue(new Error("db"));

    expect((await post(valid)).status).toBe(500);
  });
});
