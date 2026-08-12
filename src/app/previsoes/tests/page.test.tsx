import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import Page, { metadata } from "@/app/previsoes/page.tsx";

jest.mock("@/app/previsoes/_components/ForecastsScreen/index.tsx", () => ({
  ForecastsScreen: () => <p>ForecastsScreen</p>,
}));

describe("previsoes page", () => {
  it("titles the tab", () => {
    expect(metadata.title).toBe("Previsões");
  });

  it("renders nothing but its screen", () => {
    render(<Page />);

    expect(screen.getByText("ForecastsScreen")).toBeInTheDocument();
  });
});
