import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useEntryScreen } from "@/components/EntryScreen/hook.ts";
import type {
  EntryScreenConfig,
  EntryScreenLabels,
} from "@/components/EntryScreen/types.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet, apiPost } from "@/lib/api.ts";
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
const config: EntryScreenConfig<Entry, Values> = {
  resource: "forecasts",
  labels: {} as EntryScreenLabels,
  renderPeriod: () => null,
  form: () => null,
  list: { getInitialDate: () => 0, getCreatedAt: () => "" },
};
const entries = [
  { id: "e1", name: "Salário", valueCents: 100, type: "income", ownerId: "p1" },
] as Entry[];
const people = [{ id: "p1", name: "Ana" }];
const values = { type: "income" as const };
const dash = (monthly: number) => ({
  status: "ok" as const,
  ceiling: { monthly },
});
const reply = (data: unknown) => Promise.resolve({ data }) as never;

// `dashboard` sees a 1-based hit count: the read before the write, then after.
const mockGet = (dashboard: (n: number) => unknown) => {
  let n = 0;
  jest.mocked(apiGet).mockImplementation((path: string) => {
    if (path.startsWith("/api/dashboard")) {
      n += 1;
      return Promise.resolve(dashboard(n)) as never;
    }
    if (path.startsWith("/api/people")) {
      return reply(people);
    }
    if (path.startsWith("/api/period")) {
      return reply({ start: 1, end: 2 });
    }
    return reply(entries);
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  jest.mocked(useProfile).mockReturnValue({ profile: FAMILY_PROFILE } as never);
  mockGet(() => ({ data: dash(250) }));
  jest.mocked(apiPost).mockResolvedValue({ data: null });
});

describe("useEntryScreen ceiling delta", () => {
  it("reports both monthly ceilings after a successful write", async () => {
    let monthly = 250;
    mockGet(() => ({ data: dash(monthly) }));
    jest.mocked(apiPost).mockImplementation(() => {
      monthly = 100;
      return Promise.resolve({ data: null });
    });
    const { result } = renderHook(() => useEntryScreen(config));
    await waitFor(() => expect(result.current.people).toEqual(people));
    await act(async () => {
      await result.current.onAdd(values);
    });
    expect(result.current.ceilingNotice).toBe(
      "Teto deste mês: R$ 2,50 → R$ 1,00.",
    );
  });

  it("keeps the write when the later ceiling read fails", async () => {
    const reads = [{ data: dash(250) }, { error: "falhou" }];
    mockGet((n) => reads[n - 1]);
    const { result } = renderHook(() => useEntryScreen(config));
    await waitFor(() => expect(result.current.people).toEqual(people));
    await act(async () => {
      await result.current.onAdd(values);
    });
    expect(jest.mocked(apiPost)).toHaveBeenCalled();
    expect(result.current.modal).toEqual({ type: "none" });
    expect(result.current.error).toBeUndefined();
  });
});
