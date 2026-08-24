import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { StatusLine } from "@/components/StatusLine/index.tsx";

describe("StatusLine", () => {
  it("announces its sentence once", () => {
    render(<StatusLine>Teto deste mês: R$ 2,50 → R$ 1,00.</StatusLine>);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Teto deste mês: R$ 2,50 → R$ 1,00.",
    );
  });
});
