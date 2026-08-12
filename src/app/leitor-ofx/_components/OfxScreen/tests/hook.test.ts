import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useOfxScreen } from "@/app/leitor-ofx/_components/OfxScreen/hook.ts";
import { SESSION_KEY } from "@/app/leitor-ofx/_components/OfxScreen/session.helper.ts";
import { apiUpload } from "@/lib/api.ts";

jest.mock("../../../../../lib/api.ts", () => ({ apiUpload: jest.fn() }));

const report = { months: [], accounts: [], fileHash: "abc" };
const file = new File(["x"], "extrato.ofx");

const mount = async () => {
  const rendered = renderHook(() => useOfxScreen());
  await waitFor(() => expect(rendered.result.current.loaded).toBe(true));
  return rendered;
};

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  jest.mocked(apiUpload).mockResolvedValue({ data: report } as never);
});

describe("useOfxScreen", () => {
  it("opens with nothing once the storage read is done", async () => {
    const { result } = await mount();

    expect(result.current).toMatchObject({ report: null, error: null });
  });

  it("restores a report cached in this session", async () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(report));

    const { result } = await mount();

    expect(result.current.report).toEqual(report);
  });

  it("caches the report it just parsed", async () => {
    const { result } = await mount();

    await act(async () => {
      await result.current.upload(file);
    });

    expect(result.current.report).toEqual(report);
    expect(result.current.fileName).toBe("extrato.ofx");
    expect(sessionStorage.getItem(SESSION_KEY)).toBe(JSON.stringify(report));
  });

  it("reports a refused upload without caching anything", async () => {
    jest.mocked(apiUpload).mockResolvedValue({ error: "Arquivo maior" });
    const { result } = await mount();

    await act(async () => {
      await result.current.upload(file);
    });

    expect(result.current.error).toBe("Arquivo maior");
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it("reports a 2xx that carried no payload", async () => {
    jest.mocked(apiUpload).mockResolvedValue({ data: undefined });
    const { result } = await mount();

    await act(async () => {
      await result.current.upload(file);
    });

    expect(result.current.error).toBe("Erro inesperado");
  });

  it("drops the cache on close", async () => {
    const { result } = await mount();
    await act(async () => {
      await result.current.upload(file);
    });

    act(() => {
      result.current.close();
    });

    expect(result.current.report).toBeNull();
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it("swallows a drop that misses the panel, so the report survives", async () => {
    await mount();
    const event = new Event("drop", { bubbles: true, cancelable: true });

    globalThis.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });
});
