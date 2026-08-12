import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Avatar } from "@/components/AppShell/components/Header/components/Avatar/index.tsx";
import { useProfile } from "@/components/ProfileProvider/hook.ts";

jest.mock("../../../../../../ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));

describe("Avatar", () => {
  it("draws the initials, hidden from the a11y tree", () => {
    jest.mocked(useProfile).mockReturnValue({ label: "Ana Silva" } as never);

    render(<Avatar />);

    expect(screen.getByText("AS")).toHaveAttribute("aria-hidden", "true");
  });
});
