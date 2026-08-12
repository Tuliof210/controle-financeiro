import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileSelect } from "@/components/AppShell/components/Header/components/ProfileSelect/index.tsx";
import { useProfile } from "@/components/ProfileProvider/hook.ts";

jest.mock("../../../../../../ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));

const people = [{ id: "p1", name: "Ana" }];

describe("ProfileSelect", () => {
  it("offers the family sentinel above every person", () => {
    jest.mocked(useProfile).mockReturnValue({
      profile: "familia",
      people,
      setProfile: jest.fn(),
    } as never);

    render(<ProfileSelect />);

    expect(screen.getByLabelText("Perfil ativo")).toHaveValue("familia");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Família",
      "Ana",
    ]);
  });

  it("switches to the person that was picked", async () => {
    const setProfile = jest.fn();
    jest
      .mocked(useProfile)
      .mockReturnValue({ profile: "familia", people, setProfile } as never);

    render(<ProfileSelect />);
    await userEvent.selectOptions(screen.getByLabelText("Perfil ativo"), "p1");

    expect(setProfile).toHaveBeenCalledWith("p1");
  });
});
