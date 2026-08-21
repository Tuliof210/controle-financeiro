import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForecastsScreen } from "@/app/previsoes/_components/ForecastsScreen/index.tsx";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));
jest.mock("@/lib/api.ts", () => ({
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
  kind: "commitment",
  createdAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  jest.mocked(useProfile).mockReturnValue({ profile: "familia" } as never);
  jest.mocked(apiGet).mockImplementation((path: string) => {
    if (path.startsWith("/api/forecasts")) {
      return Promise.resolve({ data: [forecast] }) as never;
    }
    return Promise.resolve({ data: [] }) as never;
  });
});

describe("ForecastsScreen list controls", () => {
  it("offers classification next to name, sort and direction", () => {
    render(<ForecastsScreen />);

    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getByLabelText("Ordenar por")).toBeInTheDocument();
    expect(screen.getByLabelText("Direção")).toBeInTheDocument();
    expect(screen.getByLabelText("Classificação")).toBeInTheDocument();
  });

  it("hides a row whose name does not match", async () => {
    render(<ForecastsScreen />);
    await waitFor(() =>
      expect(screen.getByText("Aluguel")).toBeInTheDocument(),
    );

    await userEvent.type(screen.getByLabelText("Nome"), "xyz");

    expect(screen.queryByText("Aluguel")).not.toBeInTheDocument();
  });

  it("hides a commitment when Fixa is picked", async () => {
    render(<ForecastsScreen />);
    await waitFor(() =>
      expect(screen.getByText("Aluguel")).toBeInTheDocument(),
    );

    await userEvent.selectOptions(
      screen.getByLabelText("Classificação"),
      "fixed",
    );

    expect(screen.queryByText("Aluguel")).not.toBeInTheDocument();
  });
});
