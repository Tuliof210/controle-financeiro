import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { DashboardScreen } from "@/app/_components/DashboardScreen/index.tsx";
import { seenKey } from "@/app/_components/DashboardScreen/seen.helper.ts";
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

const SEEN_LINE = /Teto do mês:/;

describe("DashboardScreen seen line", () => {
  it("says nothing on the first visit and writes the snapshot", async () => {
    render(<DashboardScreen />);

    expect(await screen.findByLabelText("Valor")).toBeInTheDocument();
    expect(screen.queryByText(SEEN_LINE)).not.toBeInTheDocument();
    expect(localStorage.getItem(seenKey("50"))).toContain('"monthlyCents":250');
  });

  // With a goal saved the screen seeds Meta, so the payload the reader ends up
  // looking at is the Meta one. A single key would have stamped the default
  // cap's figures and quoted them back next visit.
  it("keeps a goal-seeded visit under its own cap", async () => {
    jest.mocked(apiGet).mockImplementation((path: string) => {
      const monthly = path.includes("cap=meta") ? 100 : 250;
      return Promise.resolve({
        data: { ...okPayload, meta: 700, ceiling: { monthly } },
      }) as never;
    });

    render(<DashboardScreen />);

    await waitFor(() =>
      expect(localStorage.getItem(seenKey("meta"))).toContain(
        '"monthlyCents":100',
      ),
    );
    expect(localStorage.getItem(seenKey("50"))).toContain('"monthlyCents":250');
  });

  it("names the change when monthly ceiling moved since last visit", async () => {
    localStorage.setItem(
      seenKey("50"),
      JSON.stringify({
        owner: "familia",
        monthlyCents: 400,
        projectedEndCents: 600,
      }),
    );

    render(<DashboardScreen />);

    expect(
      await screen.findByText("Teto do mês: R$ 4,00 → R$ 2,50."),
    ).toBeInTheDocument();
  });
});
