import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, waitFor } from "@testing-library/react";
import { entries } from "./entry-screen-config.ts";
import { mount, put, remove, seed, values } from "./entry-screen-harness.ts";

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

describe("useEntryScreen update and delete", () => {
  it("puts the edited entry's id alongside the values", async () => {
    const { result } = await mount();

    act(() => {
      result.current.openEdit(entries[0]);
    });
    act(() => {
      result.current.onUpdate(values);
    });

    await waitFor(() => expect(put).toHaveBeenCalled());
    expect(put).toHaveBeenCalledWith("/api/forecasts", {
      id: "e1",
      ...values,
    });
  });

  it("ignores an update while nothing is being edited", async () => {
    const { result } = await mount();

    act(() => {
      result.current.onUpdate(values);
    });

    expect(put).not.toHaveBeenCalled();
  });

  it("deletes by id, and only while a delete is pending", async () => {
    const { result } = await mount();

    act(() => {
      result.current.onConfirmDelete();
    });
    expect(remove).not.toHaveBeenCalled();

    act(() => {
      result.current.openDelete(entries[1]);
    });
    act(() => {
      result.current.onConfirmDelete();
    });

    await waitFor(() => expect(remove).toHaveBeenCalled());
    expect(remove).toHaveBeenCalledWith("/api/forecasts?id=e2");
  });
});
