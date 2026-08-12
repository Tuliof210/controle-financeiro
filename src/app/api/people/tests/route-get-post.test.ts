/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import type { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/people/route.ts";
import { createPerson, listPeople } from "@/app/api/people/service.ts";
import { Prisma } from "@/generated/prisma/client.ts";

jest.mock("../service.ts", () => ({
  listPeople: jest.fn(),
  createPerson: jest.fn(),
  updatePerson: jest.fn(),
  deletePerson: jest.fn(),
}));

const list = jest.mocked(listPeople);
const create = jest.mocked(createPerson);

const post = (body: unknown) =>
  POST(
    new Request("http://x/api/people", {
      method: "POST",
      body: JSON.stringify(body),
    }) as NextRequest,
  );

const known = (code: string) =>
  new Prisma.PrismaClientKnownRequestError("boom", {
    code,
    clientVersion: "7",
  });

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET", () => {
  it("wraps the list in the data envelope", async () => {
    list.mockResolvedValue([{ id: "p1" }] as never);
    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: [{ id: "p1" }] });
  });

  it("answers 500 when the service throws", async () => {
    list.mockRejectedValue(new Error("db"));
    const res = await GET();

    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ error: { code: "internal" } });
  });
});

describe("POST", () => {
  it("answers 201 with the created person", async () => {
    create.mockResolvedValue({ id: "p1" } as never);
    const res = await post({ name: "Ana", color: "violet" });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ data: { id: "p1" } });
  });

  it("answers 422 on a body the schema rejects", async () => {
    const res = await post({ name: "", color: "violet" });

    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ error: { code: "validation" } });
    expect(create).not.toHaveBeenCalled();
  });

  it("answers 409 on the unique-name violation", async () => {
    create.mockRejectedValue(known("P2002"));
    const res = await post({ name: "Ana", color: "violet" });

    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ error: { code: "duplicate" } });
  });

  it("rethrows anything else", async () => {
    create.mockRejectedValue(known("P2025"));

    await expect(post({ name: "Ana", color: "violet" })).rejects.toThrow();
  });
});
