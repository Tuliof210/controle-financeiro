import { beforeEach, describe, expect, it } from "@jest/globals";
import { persistWithDelta } from "@/components/EntryScreen/persist.helper.ts";
import { apiGet } from "@/lib/api.ts";

jest.mock("@/lib/api.ts", () => ({ apiGet: jest.fn() }));

const dash = (monthly: number) =>
  ({ data: { status: "ok", ceiling: { monthly } } }) as never;

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe("persistWithDelta", () => {
  // The modal closing is the answer to the click. Holding it for a read it does
  // not need leaves Confirmar live for another round trip, with no busy state.
  it("signals the write before the second ceiling read resolves", async () => {
    let releaseSecond: (() => void) | undefined;
    let reads = 0;
    jest.mocked(apiGet).mockImplementation(() => {
      reads += 1;
      if (reads === 1) {
        return Promise.resolve(dash(250));
      }
      return new Promise((resolve) => {
        releaseSecond = () => resolve(dash(100));
      });
    });

    const seen: string[] = [];
    const pending = persistWithDelta(
      "familia",
      () => {
        seen.push("write");
        return Promise.resolve({});
      },
      () => seen.push("written"),
    );

    // Flush every microtask: what must NOT have happened by now is the second
    // read resolving, and it cannot — nothing has called releaseSecond.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(seen).toEqual(["write", "written"]);
    expect(reads).toBe(2);

    releaseSecond?.();
    expect(await pending).toEqual({
      notice: "Teto deste mês: R$ 2,50 → R$ 1,00.",
    });
  });

  it("reports the error and never signals a write that failed", async () => {
    jest.mocked(apiGet).mockResolvedValue(dash(250));
    const written = jest.fn();

    const result = await persistWithDelta(
      "familia",
      () => Promise.resolve({ error: "falhou" }),
      written,
    );

    expect(result).toEqual({ error: "falhou" });
    expect(written).not.toHaveBeenCalled();
  });
});
