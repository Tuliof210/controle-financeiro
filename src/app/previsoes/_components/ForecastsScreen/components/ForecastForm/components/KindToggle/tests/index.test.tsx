import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KindToggle } from "@/app/previsoes/_components/ForecastsScreen/components/ForecastForm/components/KindToggle/index.tsx";

describe("KindToggle", () => {
  it("renders a labelled radio per kind, with the current one checked", () => {
    render(<KindToggle value="fixed" onChange={jest.fn()} />);

    expect(
      screen.getByRole("group", { name: "Classificação" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Fixa" })).toBeChecked();
    expect(
      screen.getByRole("radio", { name: "Compromisso futuro" }),
    ).not.toBeChecked();
  });

  it("reports the kind that was picked", async () => {
    const onChange = jest.fn();
    render(<KindToggle value="fixed" onChange={onChange} />);

    await userEvent.click(
      screen.getByRole("radio", { name: "Compromisso futuro" }),
    );

    expect(onChange).toHaveBeenCalledWith("commitment");
  });
});
