import { TextDecoder, TextEncoder } from "node:util";
import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useOfxDecoderScreen } from "@/app/ofx-decoder/_components/OfxDecoderScreen/hook.ts";

// jsdom ships neither, and decodeOfx runs on TextDecoder. Node's are the same
// WHATWG implementations the browser has.
Object.assign(globalThis, { TextDecoder, TextEncoder });

const ofxFile = (text: string, name = "extrato.ofx") =>
  ({
    name,
    arrayBuffer: () => Promise.resolve(new TextEncoder().encode(text).buffer),
  }) as unknown as File;

describe("useOfxDecoderScreen", () => {
  it("starts with nothing parsed", () => {
    const { result } = renderHook(() => useOfxDecoderScreen());

    expect(result.current).toMatchObject({
      fileName: "",
      parsed: null,
      error: null,
    });
  });

  it("parses a dropped file in the browser and names it", async () => {
    const { result } = renderHook(() => useOfxDecoderScreen());

    await act(async () => {
      await result.current.upload(ofxFile("<OFX><A>1</A></OFX>"));
    });

    expect(result.current.fileName).toBe("extrato.ofx");
    expect(result.current.parsed?.root).toMatchObject({ tag: "OFX" });
    expect(result.current.error).toBeNull();
  });

  it("refuses a file with no tag in it", async () => {
    const { result } = renderHook(() => useOfxDecoderScreen());

    await act(async () => {
      await result.current.upload(ofxFile("nada aqui", "a.pdf"));
    });

    expect(result.current.parsed).toBeNull();
    expect(result.current.error).toBe("Nenhuma tag encontrada nesse arquivo.");
  });

  it("clears everything on close", async () => {
    const { result } = renderHook(() => useOfxDecoderScreen());
    await act(async () => {
      await result.current.upload(ofxFile("<OFX><A>1</A></OFX>"));
    });

    act(() => {
      result.current.close();
    });

    expect(result.current).toMatchObject({
      fileName: "",
      parsed: null,
      error: null,
    });
  });

  it("swallows a drop that misses the panel, so the SPA survives", () => {
    renderHook(() => useOfxDecoderScreen());
    const event = new Event("drop", { bubbles: true, cancelable: true });

    globalThis.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("stops swallowing once the screen unmounts", () => {
    const { unmount } = renderHook(() => useOfxDecoderScreen());
    unmount();
    const event = new Event("dragover", { bubbles: true, cancelable: true });

    globalThis.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });
});
