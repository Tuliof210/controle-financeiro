import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardScreen } from "@/app/_components/DashboardScreen/index.tsx";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";

// Split off `index.test.tsx` for the reason `hook-profile.test.ts` was split off
// `hook.test.ts`: the 100-line cap, not a different subject.
jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));
jest.mock("@/lib/api.ts", () => ({ apiGet: jest.fn() }));
jest.mock(
  "@/app/_components/DashboardScreen/components/Board/index.tsx",
  () => ({ Board: () => <p>Board</p> }),
);

const range = { start: 202_601, end: 202_612, current: 202_608 };

const NO_ENTRIES = /Nenhum lançamento ainda/;
const OUT_OF_RANGE = /não cobre o mês atual/;

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  jest.mocked(useProfile).mockReturnValue({ profile: "familia" } as never);
});

describe("DashboardScreen announcements", () => {
  it("interrupts on a failed load and offers a way out of it", async () => {
    jest.mocked(apiGet).mockResolvedValue({ error: "Erro ao carregar" });

    render(<DashboardScreen />);

    // role=alert, not status: this is the one state the reader is stuck in.
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Erro ao carregar",
    );
    expect(
      screen.getByRole("button", { name: "Tentar de novo" }),
    ).toBeInTheDocument();
  });

  it("refetches with the same inputs when the retry is pressed", async () => {
    jest.mocked(apiGet).mockResolvedValue({ error: "Erro ao carregar" });

    render(<DashboardScreen />);
    await screen.findByRole("alert");
    expect(jest.mocked(apiGet)).toHaveBeenCalledTimes(1);

    await userEvent.click(
      screen.getByRole("button", { name: "Tentar de novo" }),
    );

    // Nothing about the profile, cap or view changed — only the nonce, which is
    // the whole reason the retry can exist at all.
    expect(jest.mocked(apiGet)).toHaveBeenCalledTimes(2);
  });

  // Asserted on the settled text, not on findByRole("status"): the loading
  // branch is polite too and resolves first, so the role alone matches the wrong
  // notice.
  it.each([
    ["no_range", NO_ENTRIES],
    ["out_of_range", OUT_OF_RANGE],
  ])("announces %s politely rather than interrupting", async (status, body) => {
    jest.mocked(apiGet).mockResolvedValue({ data: { status, range } } as never);

    render(<DashboardScreen />);

    expect(await screen.findByText(body)).toHaveAttribute("role", "status");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
