/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { NextRequest } from "next/server";
import { PUT } from "@/app/api/people/route.ts";
import { updatePerson } from "@/app/api/people/service.ts";
import { Prisma } from "@/generated/prisma/client.ts";

jest.mock("@/app/api/people/service.ts", () => ({
  listPeople: jest.fn(),
  createPerson: jest.fn(),
  updatePerson: jest.fn(),
  deletePerson: jest.fn(),
}));

const update = jest.mocked(updatePerson);

const valid = { id: "p1", name: "Ana", color: "violet" };

const put = (body: string) =>
  PUT(new NextRequest("http://x/api/people", { method: "PUT", body }));

const known = (code: string) =>
  new Prisma.PrismaClientKnownRequestError("boom", {
    code,
    clientVersion: "7",
  });

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PUT", () => {
  it("answers 200 with the updated person", async () => {
    update.mockResolvedValue(valid as never);
    const res = await put(JSON.stringify(valid));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: valid });
  });

  it("answers 422 on a malformed body", async () => {
    expect((await put("{")).status).toBe(422);
    expect(update).not.toHaveBeenCalled();
  });

  it("answers 409 on the unique-name violation", async () => {
    update.mockRejectedValue(known("P2002"));
    const res = await put(JSON.stringify(valid));

    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ error: { code: "duplicate" } });
  });

  it("answers 404 when the row is gone", async () => {
    update.mockRejectedValue(known("P2025"));
    const res = await put(JSON.stringify(valid));

    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: { code: "not_found" } });
  });

  it("answers 500 on anything else", async () => {
    update.mockRejectedValue(new Error("db"));

    expect((await put(JSON.stringify(valid))).status).toBe(500);
  });
});
