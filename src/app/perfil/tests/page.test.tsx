import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import Page, { metadata } from "@/app/perfil/page.tsx";

jest.mock("@/app/perfil/_components/SettingsScreen/index.tsx", () => ({
  SettingsScreen: () => <p>SettingsScreen</p>,
}));

describe("perfil page", () => {
  it("titles the tab", () => {
    expect(metadata.title).toBe("Perfil");
  });

  it("renders nothing but its screen", () => {
    render(<Page />);

    expect(screen.getByText("SettingsScreen")).toBeInTheDocument();
  });
});
