/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import {
  CONFLICT,
  CREATED,
  fail,
  INTERNAL,
  NOT_FOUND,
  ok,
  PAYLOAD_TOO_LARGE,
  safeFormData,
  safeJson,
  UNPROCESSABLE,
} from "@/lib/http.ts";

describe("ok", () => {
  it("wraps the payload in { data } at 200 by default", async () => {
    const res = ok({ id: "p1" });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { id: "p1" } });
  });

  it("honours an explicit status", () => {
    expect(ok(null, CREATED).status).toBe(CREATED);
  });
});

describe("fail", () => {
  it("wraps message and code in { error } at 400 by default", async () => {
    const res = fail("Dados inválidos", "validation");

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: { message: "Dados inválidos", code: "validation" },
    });
  });

  it("honours an explicit status", () => {
    expect(fail("x", "y", NOT_FOUND).status).toBe(NOT_FOUND);
  });
});

describe("safeJson", () => {
  it("returns the parsed body", async () => {
    const request = new Request("http://x/api", {
      method: "POST",
      body: '{"name":"Ana"}',
    });

    expect(await safeJson(request)).toEqual({ name: "Ana" });
  });

  it("returns undefined on a malformed body instead of throwing", async () => {
    const request = new Request("http://x/api", { method: "POST", body: "{" });

    expect(await safeJson(request)).toBeUndefined();
  });
});

describe("safeFormData", () => {
  it("returns the parsed multipart body", async () => {
    const body = new FormData();
    body.append("file", new File(["x"], "a.ofx"));
    const request = new Request("http://x/api", { method: "POST", body });

    expect((await safeFormData(request))?.get("file")).toBeInstanceOf(File);
  });

  it("returns undefined when the body is not multipart", async () => {
    const request = new Request("http://x/api", {
      method: "POST",
      body: "not-multipart",
      headers: { "content-type": "multipart/form-data; boundary=z" },
    });

    expect(await safeFormData(request)).toBeUndefined();
  });
});

describe("status constants", () => {
  it("spell the codes the routes hand to fail/ok", () => {
    expect([
      CREATED,
      NOT_FOUND,
      CONFLICT,
      PAYLOAD_TOO_LARGE,
      UNPROCESSABLE,
      INTERNAL,
    ]).toEqual([201, 404, 409, 413, 422, 500]);
  });
});
