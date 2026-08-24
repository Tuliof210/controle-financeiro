import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { AffordAsk } from "@/app/_components/DashboardScreen/components/AffordAsk/index.tsx";

const CEILING = 250;
const CABE = /Cabe\. Sobram R\$ 1,50 neste mês\./;
const NAO_CABE = /Não cabe\. Faltam R\$ 1,50 neste mês\./;

describe("AffordAsk", () => {
  it("stays silent while the field is empty or zero", () => {
    render(<AffordAsk monthlyCents={CEILING} />);

    expect(screen.getByLabelText("Valor")).toHaveValue("0,00");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("says how much remains when the amount fits the ceiling", () => {
    render(<AffordAsk monthlyCents={CEILING} />);

    fireEvent.change(screen.getByLabelText("Valor"), {
      target: { value: "100" },
    });

    expect(screen.getByRole("status")).toHaveTextContent(CABE);
  });

  it("says how much is missing when the amount does not fit", () => {
    render(<AffordAsk monthlyCents={CEILING} />);

    fireEvent.change(screen.getByLabelText("Valor"), {
      target: { value: "400" },
    });

    expect(screen.getByRole("status")).toHaveTextContent(NAO_CABE);
  });
});
