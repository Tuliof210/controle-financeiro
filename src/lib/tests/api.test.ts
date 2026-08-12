/**
 * @jest-environment node
 */
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from "@/lib/api.ts";

type Fetch = typeof globalThis.fetch;

const stubFetch = (impl: () => Promise<unknown>) => {
  const spy = jest.fn(impl);
  globalThis.fetch = spy as unknown as Fetch;
  return spy;
};

const jsonResponse = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

afterEach(() => {
  jest.restoreAllMocks();
});

describe("request envelope", () => {
  it("unwraps { data } on a 2xx", async () => {
    stubFetch(() => jsonResponse({ data: { id: "p1" } }));

    expect(await apiGet<{ id: string }>("/api/people")).toEqual({
      data: { id: "p1" },
    });
  });

  it("unwraps { error } on a non-2xx", async () => {
    stubFetch(() =>
      jsonResponse({ error: { message: "Já existe", code: "duplicate" } }, 409),
    );

    expect(await apiGet("/api/people")).toEqual({
      error: "Já existe",
      code: "duplicate",
    });
  });

  it("falls back when the failure body carries no message", async () => {
    stubFetch(() => Promise.resolve(new Response("<html>", { status: 500 })));

    expect(await apiGet("/api/people")).toEqual({
      error: "Erro inesperado",
      code: undefined,
    });
  });

  it("reports a thrown fetch as the same envelope", async () => {
    stubFetch(() => Promise.reject(new Error("offline")));

    expect(await apiGet("/api/people")).toEqual({ error: "Erro inesperado" });
  });
});

describe("verbs", () => {
  it("posts JSON with the content-type header", async () => {
    const spy = stubFetch(() => jsonResponse({ data: 1 }));
    await apiPost("/api/goals", { name: "Casa" });

    expect(spy).toHaveBeenCalledWith("/api/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: '{"name":"Casa"}',
    });
  });

  it("puts JSON the same way", async () => {
    const spy = stubFetch(() => jsonResponse({ data: 1 }));
    await apiPut("/api/goals", { id: "g1" });

    expect(spy.mock.calls[0]?.[1]).toMatchObject({
      method: "PUT",
      body: '{"id":"g1"}',
    });
  });

  it("deletes without a body", async () => {
    const spy = stubFetch(() => jsonResponse({ data: null }));
    await apiDelete("/api/goals/g1");

    expect(spy).toHaveBeenCalledWith("/api/goals/g1", { method: "DELETE" });
  });

  it("uploads multipart without setting content-type", async () => {
    const spy = stubFetch(() => jsonResponse({ data: null }));
    await apiUpload("/api/ofx", new File(["x"], "a.ofx"));

    const init = spy.mock.calls[0]?.[1] as RequestInit;
    expect(init.body).toBeInstanceOf(FormData);
    expect(init.headers).toBeUndefined();
  });
});
