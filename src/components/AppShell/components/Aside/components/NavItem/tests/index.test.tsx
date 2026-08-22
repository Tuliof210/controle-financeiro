import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { NavItem } from "@/components/AppShell/components/Aside/components/NavItem/index.tsx";

const props = {
  href: "/previsoes",
  label: "Previsões",
  active: false,
  collapsed: true,
  icon: "layoutDashboard",
};

describe("NavItem", () => {
  it("keeps an accessible name even on the icon-only rail", () => {
    render(<NavItem {...props} />);

    const link = screen.getByRole("link", { name: "Previsões" });

    expect(link).toHaveAttribute("href", "/previsoes");
    expect(link).not.toHaveAttribute("aria-current");
  });

  it("marks the current page", () => {
    render(<NavItem {...props} active={true} />);

    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
  });
});
