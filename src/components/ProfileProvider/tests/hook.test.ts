import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useProfile,
  useProfileState,
} from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";
import { FAMILY_PROFILE } from "@/lib/ownership.ts";

jest.mock("@/lib/api.ts", () => ({ apiGet: jest.fn() }));

const get = jest.mocked(apiGet);

const people = [{ id: "p1", name: "Ana", color: "violet" }];

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  get.mockResolvedValue({ data: people } as never);
});

describe("useProfileState", () => {
  it("starts on the family sentinel and loads the people", async () => {
    const { result } = renderHook(() => useProfileState());

    expect(result.current.profile).toBe(FAMILY_PROFILE);
    await waitFor(() => expect(result.current.people).toEqual(people));
    expect(result.current.label).toBe("Família");
  });

  it("restores the profile saved in localStorage", async () => {
    localStorage.setItem("profile", "p1");

    const { result } = renderHook(() => useProfileState());

    await waitFor(() => expect(result.current.label).toBe("Ana"));
    expect(result.current.profile).toBe("p1");
  });

  it("persists the profile it is switched to", async () => {
    const { result } = renderHook(() => useProfileState());
    await waitFor(() => expect(result.current.people).toEqual(people));

    act(() => {
      result.current.setProfile("p1");
    });

    expect(localStorage.getItem("profile")).toBe("p1");
  });

  it("heals a stored id whose person has been deleted", async () => {
    localStorage.setItem("profile", "gone");

    const { result } = renderHook(() => useProfileState());

    await waitFor(() => expect(result.current.profile).toBe(FAMILY_PROFILE));
    expect(localStorage.getItem("profile")).toBe(FAMILY_PROFILE);
  });

  it("keeps the people list empty when the request fails", async () => {
    get.mockResolvedValue({ error: "Erro inesperado" } as never);

    const { result } = renderHook(() => useProfileState());

    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(result.current.people).toEqual([]);
  });
});

describe("useProfile", () => {
  it("refuses to run outside a provider", () => {
    expect(() => renderHook(() => useProfile())).toThrow(
      "useProfile must be used within a ProfileProvider",
    );
  });
});
