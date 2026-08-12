import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { TotalsRow } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/MonthTable/components/TotalsRow/index.tsx";

const props = {
  income: "R$ 1.000,00",
  expense: "R$ 400,00",
  balance: "R$ 600,00",
  count: 12,
  negative: false,
};

describe("TotalsRow", () => {
  it("heads the footer row with Total", () => {
    render(
      <table>
        <tfoot>
          <TotalsRow {...props} />
        </tfoot>
      </table>,
    );

    expect(screen.getByRole("rowheader")).toHaveTextContent("Total");
    expect(screen.getByText("R$ 600,00")).toBeInTheDocument();
  });
});
