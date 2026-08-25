import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { DashboardScreen } from "@/app/_components/DashboardScreen/index.tsx";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));
jest.mock("@/lib/api.ts", () => ({ apiGet: jest.fn() }));
jest.mock(
  "@/app/_components/DashboardScreen/components/Board/index.tsx",
  () => ({
    Board: () => <p>Board</p>,
  }),
);

const range = { start: 202_601, end: 202_612, current: 202_608 };

const noRange = { status: "no_range" };

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

const NO_ENTRIES = /Nenhum lançamento ainda/;
const OUT_OF_RANGE = /\(Jan\/26–Dez\/26\) não cobre o mês atual/;

describe("DashboardScreen", () => {
  it("titles the screen and carries no control of its own", () => {
    jest.mocked(apiGet).mockResolvedValue({ data: noRange } as never);

    render(<DashboardScreen />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("says the database is empty on no_range", async () => {
    jest.mocked(apiGet).mockResolvedValue({ data: noRange } as never);

    render(<DashboardScreen />);

    expect(await screen.findByText(NO_ENTRIES)).toBeInTheDocument();
  });

  it("names both ends of the span on out_of_range", async () => {
    jest
      .mocked(apiGet)
      .mockResolvedValue({ data: { status: "out_of_range", range } } as never);

    render(<DashboardScreen />);

    expect(await screen.findByText(OUT_OF_RANGE)).toBeInTheDocument();
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
