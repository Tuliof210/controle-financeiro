import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { DashboardScreen } from "@/app/_components/DashboardScreen/index.tsx";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";

// Its own file rather than more cases in index.test.tsx: that file pins the four
// whole-screen states, and this notice is the one that renders BESIDE the board
// instead of in place of it.
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
};

const OVER_HEADROOM = /passou do máximo que o período aguenta/;
const PERFIL = "Ajustes";

const mount = (overHeadroom: boolean) => {
  jest
    .mocked(apiGet)
    .mockResolvedValue({ data: { ...okPayload, overHeadroom } } as never);
  render(<DashboardScreen />);
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useProfile).mockReturnValue({ profile: "familia" } as never);
});

describe("DashboardScreen overHeadroom notice", () => {
  it("warns above the board and links to the Perfil screen", async () => {
    mount(true);

    expect(await screen.findByText(OVER_HEADROOM)).toBeInTheDocument();
    // The board stays: the negative months it now shows are the point.
    expect(screen.getByText("Board")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: PERFIL })).toHaveAttribute(
      "href",
      "/perfil",
    );
  });

  it("says nothing while every saved amount still fits", async () => {
    mount(false);

    expect(await screen.findByText("Board")).toBeInTheDocument();
    expect(screen.queryByText(OVER_HEADROOM)).not.toBeInTheDocument();
  });
});
