import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { ProfileProvider } from "@/components/ProfileProvider/index.tsx";
import { apiGet } from "@/lib/api.ts";

jest.mock("@/lib/api.ts", () => ({ apiGet: jest.fn() }));

const get = jest.mocked(apiGet);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  get.mockResolvedValue({ data: [{ id: "p1", name: "Ana" }] } as never);
});

describe("ProfileProvider", () => {
  it("gives its children the active profile", async () => {
    localStorage.setItem("profile", "p1");

    const { result } = renderHook(() => useProfile(), {
      wrapper: ProfileProvider,
    });

    await waitFor(() => expect(result.current.label).toBe("Ana"));
  });
});
