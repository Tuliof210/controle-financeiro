import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CapSelector } from "@/app/_components/DashboardScreen/components/CeilingCard/components/CapSelector/index.tsx";

const LEGEND = /Liberar do saldo/;

describe("CapSelector", () => {
  it("offers the three percentages while no goal is saved", () => {
    render(
      <CapSelector
        value="50"
        hasMeta={false}
        hint="hint"
        onChange={jest.fn()}
      />,
    );

    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "50%" })).toBeChecked();
  });

  it("adds the Meta segment once there is a goal", () => {
    render(
      <CapSelector
        value="50"
        hasMeta={true}
        hint="hint"
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByRole("radio", { name: "Meta" })).toBeInTheDocument();
  });

  it("reports the target that was picked", async () => {
    const onChange = jest.fn();
    render(
      <CapSelector
        value="50"
        hasMeta={false}
        hint="hint"
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("radio", { name: "75%" }));

    expect(onChange).toHaveBeenCalledWith("75");
  });

  // The segments are bare percentages of a quantity nothing else on the card
  // names. The legend used to be clipped, so only assistive tech ever got it.
  it("names what the percentages are a share of, in view", () => {
    render(
      <CapSelector
        value="50"
        hasMeta={false}
        hint="hint"
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByRole("group", { name: LEGEND })).toBeInTheDocument();
    expect(screen.getByText("Liberar do saldo:")).toBeVisible();
  });

  it("explains the cap's trade-off from the control that causes it", () => {
    render(
      <CapSelector
        value="50"
        hasMeta={false}
        hint="sobra menos para os meses seguintes"
        onChange={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "O que o seletor de teto muda" }),
    ).toBeInTheDocument();
  });
});
