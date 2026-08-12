import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { ForecastsScreen } from "@/app/previsoes/_components/ForecastsScreen/index.tsx";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";

jest.mock("../../../../../components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));
jest.mock("../../../../../lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

const forecast = {
  id: "f1",
  name: "Aluguel",
  valueCents: 150_000,
  type: "expense",
  ownerId: "p1",
  months: [202_601, 202_602],
  simulated: true,
};

const seedApi = (period: unknown) => {
  jest.mocked(apiGet).mockImplementation((path: string) => {
    if (path.startsWith("/api/forecasts")) {
      return Promise.resolve({ data: [forecast] }) as never;
    }
    if (path.startsWith("/api/period")) {
      return Promise.resolve({ data: period }) as never;
    }
    return Promise.resolve({ data: [] }) as never;
  });
};

beforeEach(() => {
  jest.mocked(useProfile).mockReturnValue({ profile: "familia" } as never);
  seedApi(null);
});

describe("ForecastsScreen", () => {
  it("titles the screen in pt-BR", () => {
    render(<ForecastsScreen />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Previsões" }),
    ).toBeInTheDocument();
  });

  it("reads a row's period as its intervals, badged when simulated", async () => {
    render(<ForecastsScreen />);

    await waitFor(() =>
      expect(screen.getByText("Jan/26–Fev/26")).toBeInTheDocument(),
    );
    expect(screen.getByText("Simulado")).toBeInTheDocument();
  });

  it("draws no band while there is no range to measure against", async () => {
    const { container } = render(<ForecastsScreen />);
    await waitFor(() =>
      expect(screen.getByText("Aluguel")).toBeInTheDocument(),
    );

    expect(container.querySelector('[data-cell="bar"]')).toBeNull();
  });

  it("draws the coverage band once a range exists", async () => {
    seedApi({ start: 202_601, end: 202_604 });

    const { container } = render(<ForecastsScreen />);
    await waitFor(() =>
      expect(container.querySelector('[data-cell="bar"]')).not.toBeNull(),
    );
  });
});
