import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SimulatedSection } from "@/app/perfil/_components/SettingsScreen/components/SimulatedSection/index.tsx";

const LABEL = "Contar previsões simuladas no dashboard";

describe("SimulatedSection", () => {
  it("keeps the essay in the hint and shows the current state", () => {
    render(<SimulatedSection value={true} onChange={jest.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Dados simulados" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Como Dados simulados é calculado" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(LABEL)).toBeChecked();
  });

  it("starts off when simulations are left out", () => {
    render(<SimulatedSection value={false} onChange={jest.fn()} />);

    expect(screen.getByLabelText(LABEL)).not.toBeChecked();
  });

  it("reports both directions of the toggle", async () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <SimulatedSection value={false} onChange={onChange} />,
    );

    await userEvent.click(screen.getByLabelText(LABEL));
    expect(onChange).toHaveBeenLastCalledWith(true);

    rerender(<SimulatedSection value={true} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText(LABEL));
    expect(onChange).toHaveBeenLastCalledWith(false);
  });
});
