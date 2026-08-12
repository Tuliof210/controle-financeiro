import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import Page, { metadata } from "@/app/page.tsx";

jest.mock("@/app/_components/DashboardScreen/index.tsx", () => ({
  DashboardScreen: () => <p>DashboardScreen</p>,
}));

describe("dashboard page", () => {
  it("titles the tab, the root route having no template to fill", () => {
    expect(metadata.title).toBe("Dashboard · Monevo");
  });

  it("renders nothing but its screen", () => {
    render(<Page />);

    expect(screen.getByText("DashboardScreen")).toBeInTheDocument();
  });
});
