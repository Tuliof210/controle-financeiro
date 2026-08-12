import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { ProfileProvider } from "@/components/ProfileProvider/index.tsx";
import { apiGet } from "@/lib/api.ts";

jest.mock("@/lib/api.ts", () => ({ apiGet: jest.fn() }));

const get = jest.mocked(apiGet);

function Consumer() {
  return <output>{useProfile().label}</output>;
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  get.mockResolvedValue({ data: [{ id: "p1", name: "Ana" }] } as never);
});

describe("ProfileProvider", () => {
  it("gives its children the active profile", async () => {
    localStorage.setItem("profile", "p1");

    render(
      <ProfileProvider>
        <Consumer />
      </ProfileProvider>,
    );

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Ana"),
    );
  });
});
