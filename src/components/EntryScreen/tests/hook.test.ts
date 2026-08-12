import { beforeEach, describe, expect, it } from "@jest/globals";
import { act } from "@testing-library/react";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { entries } from "./entry-screen-config.ts";
import { mount, seed } from "./entry-screen-harness.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));
jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  seed();
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

  it("opens the add modal on the type the section asked for", async () => {
    const { result } = await mount();

    act(() => {
      result.current.openAdd("expense");
    });

    expect(result.current.modal).toEqual({ type: "add", kind: "expense" });
  });

  it("opens edit and delete on the row's own entry, then closes", async () => {
    const { result } = await mount();

    act(() => {
      result.current.openEdit(entries[0]);
    });
    expect(result.current.modal).toEqual({ type: "edit", entry: entries[0] });

    act(() => {
      result.current.openDelete(entries[1]);
    });
    expect(result.current.modal).toEqual({ type: "delete", entry: entries[1] });

    act(() => {
      result.current.close();
    });
    expect(result.current.modal).toEqual({ type: "none" });
  });
});
