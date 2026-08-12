import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { UploadCard } from "@/app/leitor-ofx/_components/OfxScreen/components/UploadCard/index.tsx";

describe("UploadCard", () => {
  it("warns that confirmed totals do reach the database", () => {
    render(<UploadCard error={null} onFile={jest.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Enviar extrato OFX" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/vão para o banco/)).toBeInTheDocument();
  });

  it("shows an error only when there is one", () => {
    const { rerender } = render(<UploadCard error={null} onFile={jest.fn()} />);

    expect(
      screen.queryByText("Arquivo maior que 5 MB"),
    ).not.toBeInTheDocument();

    rerender(<UploadCard error="Arquivo maior que 5 MB" onFile={jest.fn()} />);

    expect(screen.getByText("Arquivo maior que 5 MB")).toBeInTheDocument();
  });
});
