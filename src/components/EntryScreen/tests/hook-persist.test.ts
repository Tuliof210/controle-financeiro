import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useEntryScreen } from "@/components/EntryScreen/hook.ts";
import type {
  EntryScreenConfig,
  EntryScreenLabels,
} from "@/components/EntryScreen/types.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api.ts";
import type { Entry, EntryType } from "@/lib/entry-types.ts";
import { FAMILY_PROFILE } from "@/lib/ownership.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));
jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

interface Values {
  type: EntryType;
}

// The labels only pass through this hook — an empty set is enough.
const config: EntryScreenConfig<Entry, Values> = {
  resource: "forecasts",
  labels: {} as EntryScreenLabels,
  renderPeriod: () => null,
  form: () => null,
  list: { getInitialDate: () => 0, getCreatedAt: () => "" },
};

const entries = [
  { id: "e1", name: "Salário", valueCents: 100, type: "income", ownerId: "p1" },
  { id: "e2", name: "Luz", valueCents: 200, type: "expense", ownerId: "p2" },
] as Entry[];

const people = [{ id: "p1", name: "Ana" }];

const mount = async () => {
  const rendered = renderHook(() => useEntryScreen(config));
  await waitFor(() => expect(rendered.result.current.people).toEqual(people));
  return rendered;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useProfile).mockReturnValue({ profile: FAMILY_PROFILE } as never);
  jest.mocked(apiGet).mockImplementation((path: string) => {
    if (path.startsWith("/api/people")) {
      return Promise.resolve({ data: people }) as never;
    }
    if (path.startsWith("/api/period")) {
      return Promise.resolve({ data: { start: 1, end: 2 } }) as never;
    }
    return Promise.resolve({ data: entries }) as never;
  });
  for (const write of [apiPost, apiPut, apiDelete]) {
    jest.mocked(write).mockResolvedValue({ data: null });
  }
});

const values = { type: "income" as const };

describe("useEntryScreen create", () => {
  it("posts a new entry and closes on success", async () => {
    const { result } = await mount();

    await act(async () => {
      await result.current.onAdd(values);
    });

    expect(jest.mocked(apiPost)).toHaveBeenCalledWith("/api/forecasts", values);
    expect(result.current.modal).toEqual({ type: "none" });
  });

  it("keeps the modal open and reports a refused write", async () => {
    jest.mocked(apiPost).mockResolvedValue({ error: "Dados inválidos" });
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
});
