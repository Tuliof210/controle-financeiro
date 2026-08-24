import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
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

const okPayload = {
  status: "ok",
  range: { start: 202_601, end: 202_612, current: 202_608 },
  points: [{ month: 202_608, income: 1000, expense: 400, cumulative: 600 }],
  ceiling: {
    monthly: 250,
    weekly: 62,
    daily: 8,
    tightest: null,
    firstRed: null,
    months: [],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  jest.mocked(useProfile).mockReturnValue({ profile: "familia" } as never);
  jest.mocked(apiGet).mockResolvedValue({ data: okPayload } as never);
});

describe("DashboardScreen afford ask", () => {
  it("answers against the loaded monthly ceiling once a value is typed", async () => {
    render(<DashboardScreen />);

    expect(await screen.findByLabelText("Valor")).toBeInTheDocument();
    expect(screen.queryByText(/Cabe\.|Não cabe\./)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Valor"), {
      target: { value: "100" },
    });

    expect(
      await screen.findByText("Cabe. Sobram R$ 1,50 neste mês."),
    ).toBeInTheDocument();
  });
});
