import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { CeilingCard } from "@/app/_components/DashboardScreen/components/CeilingCard/index.tsx";
import type { Ceiling } from "@/app/api/dashboard/ceiling.types.ts";

// Split off `index.test.tsx` for the 100-line cap, the way `hook-profile.test.ts`
// splits off `hook.test.ts`.
const month = (value: number) => ({
  month: value,
  budget: 250,
  ceilingBalance: 1000,
  ceilingLeft: 750,
});

const SHOW_ALL = /Ver todos/;

describe("CeilingCard disclosure", () => {
  // aria-expanded said the button HAS a state; nothing said which region that
  // state belonged to — and the button renders AFTER the rows it reveals, so an
  // assistive reader had no route back to them.
  it("points the disclosure at the table it expands", () => {
    // Nine months, so the list exceeds useShowAll's cap and the toggle renders.
    render(
      <CeilingCard
        ceiling={
          {
            monthly: 250,
            weekly: 62,
            daily: 8,
            tightest: 202_612,
            firstRed: null,
            months: Array.from({ length: 9 }, (_, i) => month(202_608 + i)),
          } as Ceiling
        }
        meta={null}
        current={202_608}
        cap="50"
        onCapChange={jest.fn()}
      />,
    );

    const toggle = screen.getByRole("button", { name: SHOW_ALL });
    const id = toggle.getAttribute("aria-controls");

    expect(id).toBe("ceiling-months");
    expect(document.getElementById(id ?? "")).not.toBeNull();
  });
});
