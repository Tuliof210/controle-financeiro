import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShowAllToggle } from "@/app/_components/DashboardScreen/components/ShowAllToggle/index.tsx";

describe("ShowAllToggle", () => {
  it("announces the disclosure state it is in", () => {
    const { rerender } = render(
      <ShowAllToggle
        label="Ver todos (12)"
        expanded={false}
        onClick={jest.fn()}
      />,
    );

    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    rerender(
      <ShowAllToggle
        label="Mostrar menos"
        expanded={true}
        onClick={jest.fn()}
      />,
    );

    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("reports the press", async () => {
    const onClick = jest.fn();
    render(
      <ShowAllToggle
        label="Ver todos (12)"
        expanded={false}
        onClick={onClick}
      />,
    );

    await userEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalled();
  });
});
