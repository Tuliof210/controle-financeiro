/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { NextRequest } from "next/server";
import { DELETE } from "@/app/api/people/route.ts";
import { deletePerson } from "@/app/api/people/service.ts";
import { Prisma } from "@/generated/prisma/client.ts";

jest.mock("../service.ts", () => ({
  listPeople: jest.fn(),
  createPerson: jest.fn(),
  updatePerson: jest.fn(),
  deletePerson: jest.fn(),
}));

const remove = jest.mocked(deletePerson);

const del = (query: string) =>
  DELETE(new NextRequest(`http://x/api/people${query}`, { method: "DELETE" }));

const known = (code: string) =>
  new Prisma.PrismaClientKnownRequestError("boom", {
    code,
    clientVersion: "7",
  });

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DELETE", () => {
  it("echoes the id it removed", async () => {
    remove.mockResolvedValue(undefined);
    const res = await del("?id=p1");

    expect(await res.json()).toEqual({ data: { id: "p1" } });
  });

  it("answers 422 without an id", async () => {
    expect((await del("")).status).toBe(422);
    expect(remove).not.toHaveBeenCalled();
  });

  it("answers 404 when the row is gone", async () => {
    remove.mockRejectedValue(known("P2025"));
    const res = await del("?id=p1");

    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: { code: "not_found" } });
  });

  it("answers 409 when the person still has entries", async () => {
    remove.mockRejectedValue(known("P2003"));
    const res = await del("?id=p1");

    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ error: { code: "conflict" } });
  });

  it("rethrows anything else", async () => {
    remove.mockRejectedValue(new Error("db"));

    await expect(del("?id=p1")).rejects.toThrow();
  });
});
