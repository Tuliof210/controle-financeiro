import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import Page, { metadata } from "@/app/configuracoes/page.tsx";

jest.mock("../_components/SettingsScreen/index.tsx", () => ({
  SettingsScreen: () => <p>SettingsScreen</p>,
}));

describe("configuracoes page", () => {
  it("titles the tab", () => {
    expect(metadata.title).toBe("Configurações");
  });

  it("renders nothing but its screen", () => {
    render(<Page />);

    expect(screen.getByText("SettingsScreen")).toBeInTheDocument();
  });
});
