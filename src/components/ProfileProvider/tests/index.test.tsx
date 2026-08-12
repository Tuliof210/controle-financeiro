import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { Avatar } from "@/components/AppShell/components/Header/components/Avatar/index.tsx";
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

    render(
      <ProfileProvider>
        <Avatar />
      </ProfileProvider>,
    );

    // Avatar is a real consumer of the context, so the assertion needs no
    // local component of its own — the initials come from the active profile.
    await waitFor(() => expect(screen.getByText("A")).toBeInTheDocument());
  });
});
