/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import type { NextRequest } from "next/server";
import { POST } from "@/app/api/ofx/route.ts";
import { readOfx } from "@/app/api/ofx/service.ts";

jest.mock("../service.ts", () => ({ readOfx: jest.fn() }));

const read = jest.mocked(readOfx);

const upload = (file?: File) => {
  const body = new FormData();
  if (file) {
    body.append("file", file);
  }
  return POST(
    new Request("http://x/api/ofx", { method: "POST", body }) as NextRequest,
  );
};

const MEGABYTE = 1024 * 1024;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST", () => {
  it("answers 422 when no file is attached", async () => {
    const res = await upload();

    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ error: { code: "validation" } });
  });

  it("answers 422 on an empty file", async () => {
    expect((await upload(new File([], "a.ofx"))).status).toBe(422);
    expect(read).not.toHaveBeenCalled();
  });

  it("answers 413 above the 5 MB cap", async () => {
    const big = new File([new Uint8Array(5 * MEGABYTE + 1)], "a.ofx");
    const res = await upload(big);

    expect(res.status).toBe(413);
    expect(await res.json()).toMatchObject({ error: { code: "too_large" } });
  });

  it("answers the report the service read", async () => {
    read.mockReturnValue({
      status: "ok",
      report: { fileName: "a.ofx" },
    } as never);
    const res = await upload(new File(["<OFX>"], "a.ofx"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { fileName: "a.ofx" } });
  });

  it("maps every refusal to its own wire code", async () => {
    const codes = {
      notOfx: "not_ofx",
      cardOnly: "card_only",
      noStatement: "no_statement",
      empty: "empty",
    };

    const refuse = async ([status, code]: [string, string]) => {
      read.mockReturnValue({ status } as never);
      const res = await upload(new File(["x"], "a.ofx"));

      expect(res.status).toBe(422);
      expect(await res.json()).toMatchObject({ error: { code } });
    };

    // Serial: each case re-arms the same mock before calling the handler.
    await Object.entries(codes).reduce(
      (previous, entry) => previous.then(() => refuse(entry)),
      Promise.resolve(),
    );
  });
});
