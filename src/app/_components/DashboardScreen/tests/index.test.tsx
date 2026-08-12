import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { DashboardScreen } from "@/app/_components/DashboardScreen/index.tsx";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";

jest.mock("../../../../components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));
jest.mock("../../../../lib/api.ts", () => ({ apiGet: jest.fn() }));
jest.mock("../components/Board/index.tsx", () => ({
  Board: () => <p>Board</p>,
}));

const range = { start: 202_601, end: 202_612, current: 202_608 };

const okPayload = {
  status: "ok",
  range,
  points: [{ month: 202_608, income: 1000, expense: 400, cumulative: 600 }],
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  jest.mocked(useProfile).mockReturnValue({ profile: "familia" } as never);
});

describe("DashboardScreen", () => {
  it("titles the screen and offers the simulation view in every state", () => {
    jest
      .mocked(apiGet)
      .mockResolvedValue({ data: { status: "no_range" } } as never);

    render(<DashboardScreen />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Dados do dashboard")).toBeInTheDocument();
  });

  it("says the database is empty on no_range", async () => {
    jest
      .mocked(apiGet)
      .mockResolvedValue({ data: { status: "no_range" } } as never);

    render(<DashboardScreen />);

    expect(
      await screen.findByText(/Nenhum lançamento ainda/),
    ).toBeInTheDocument();
  });

  it("names both ends of the span on out_of_range", async () => {
    jest
      .mocked(apiGet)
      .mockResolvedValue({ data: { status: "out_of_range", range } } as never);

    render(<DashboardScreen />);

    expect(
      await screen.findByText(/\(Jan\/26–Dez\/26\) não cobre o mês atual/),
    ).toBeInTheDocument();
  });

  it("reports a refused load rather than an empty board", async () => {
    jest.mocked(apiGet).mockResolvedValue({ error: "Erro ao carregar" });

    render(<DashboardScreen />);

    expect(await screen.findByText("Erro ao carregar")).toBeInTheDocument();
  });

  it("renders the board once the payload is ok", async () => {
    jest.mocked(apiGet).mockResolvedValue({ data: okPayload } as never);

    render(<DashboardScreen />);

    await waitFor(() => expect(screen.getByText("Board")).toBeInTheDocument());
  });
});
