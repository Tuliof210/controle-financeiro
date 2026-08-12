import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MonthPicker } from "@/components/MonthPicker/index.tsx";

const props = { label: "Início", id: "inicio", onChange: jest.fn() };

describe("MonthPicker", () => {
  it("labels each select with the field it belongs to", () => {
    render(<MonthPicker {...props} value={202_608} />);

    expect(screen.getByLabelText("Início - mês")).toHaveValue("8");
    expect(screen.getByLabelText("Início - ano")).toHaveValue("2026");
  });

  it("names the months in pt-BR", () => {
    render(<MonthPicker {...props} value={202_608} />);

    expect(screen.getByRole("option", { name: "Ago" })).toBeInTheDocument();
  });

  it("reports the recomposed month when one is picked", async () => {
    const onChange = jest.fn();
    render(<MonthPicker {...props} value={202_608} onChange={onChange} />);

    await userEvent.selectOptions(screen.getByLabelText("Início - mês"), "12");

    expect(onChange).toHaveBeenCalledWith(202_612);
  });
});
