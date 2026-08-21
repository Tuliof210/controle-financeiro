import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useEntryScreen } from "@/components/EntryScreen/hook.ts";
import type {
  EntryScreenConfig,
  EntryScreenLabels,
} from "@/components/EntryScreen/types.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";
import { DEFAULT_ENTRY_LIST_QUERY } from "@/lib/entry-list-query.ts";
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
});

describe("useEntryScreen", () => {
  it("loads the entries, the people and the period", async () => {
    const { result } = await mount();

    expect(result.current.income).toHaveLength(1);
    expect(result.current.expense).toHaveLength(1);
    expect(result.current.period).toEqual({ start: 1, end: 2 });
  });

  it("shows only the active profile's entries", async () => {
    jest.mocked(useProfile).mockReturnValue({ profile: "p1" } as never);

    const { result } = await mount();

    expect(result.current.income).toHaveLength(1);
    expect(result.current.expense).toHaveLength(0);
  });

  it("applies the profile before the name query", async () => {
    jest.mocked(useProfile).mockReturnValue({ profile: "p1" } as never);
    const { result } = await mount();

    act(() => {
      result.current.onQueryChange({
        ...DEFAULT_ENTRY_LIST_QUERY,
        name: "Luz",
      });
    });

    expect(result.current.income).toHaveLength(0);
    expect(result.current.expense).toHaveLength(0);
  });
});
