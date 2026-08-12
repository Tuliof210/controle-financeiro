import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useEntryScreen } from "@/components/EntryScreen/hook.ts";
import { config } from "./entry-screen-config.ts";
import {
  get,
  mount,
  post,
  route,
  seed,
  values,
} from "./entry-screen-harness.ts";

jest.mock("../../ProfileProvider/hook.ts", () => ({ useProfile: jest.fn() }));
jest.mock("../../../lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  seed();
});

describe("useEntryScreen create", () => {
  it("posts a new entry and closes on success", async () => {
    const { result } = await mount();

    await act(async () => {
      await result.current.onAdd(values);
    });

    expect(post).toHaveBeenCalledWith("/api/forecasts", values);
    expect(result.current.modal).toEqual({ type: "none" });
  });

  it("keeps the modal open and reports a refused write", async () => {
    post.mockResolvedValue({ error: "Dados inválidos" });
    const { result } = await mount();

    act(() => {
      result.current.openAdd("income");
    });
    await act(async () => {
      await result.current.onAdd(values);
    });

    expect(result.current.error).toBe("Dados inválidos");
    expect(result.current.modal).toMatchObject({ type: "add" });
  });

  it("reports a failed list request", async () => {
    get.mockImplementation((path: string) => {
      if (path.startsWith("/api/forecasts")) {
        return Promise.resolve({ error: "Erro ao carregar" }) as never;
      }
      return route(path);
    });

    const { result } = renderHook(() => useEntryScreen(config));

    await waitFor(() => expect(result.current.error).toBe("Erro ao carregar"));
  });
});
