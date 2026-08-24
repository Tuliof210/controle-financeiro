import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SimulationSelect } from "@/app/_components/DashboardScreen/components/SimulationSelect/index.tsx";

describe("SimulationSelect", () => {
  it("offers the two views, on the active one", () => {
    render(<SimulationSelect value="real" onChange={jest.fn()} />);

    expect(screen.getByLabelText("Dados do dashboard")).toHaveValue("real");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Apenas dados reais",
      "Incluir simulações",
    ]);
  });

  it("reports the view that was picked", async () => {
    const onChange = jest.fn();
    render(<SimulationSelect value="real" onChange={onChange} />);

    await userEvent.selectOptions(
      screen.getByLabelText("Dados do dashboard"),
      "all",
    );

    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("shows a visible label", () => {
    render(<SimulationSelect value="real" onChange={jest.fn()} />);

    expect(screen.getByText("Dados do dashboard")).toBeVisible();
  });
});
