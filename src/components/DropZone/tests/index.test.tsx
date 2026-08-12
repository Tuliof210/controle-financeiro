import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { DropZone } from "@/components/DropZone/index.tsx";

describe("DropZone", () => {
  it("offers the file button and the drag prompt", () => {
    render(<DropZone onFile={jest.fn()} />);

    expect(screen.getByText("Arraste o extrato .ofx")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Escolher arquivo" }),
    ).toBeInTheDocument();
  });

  it("states the 5 MB cap the route actually enforces", () => {
    render(<DropZone onFile={jest.fn()} />);

    expect(screen.getByText("· até 5 MB")).toBeInTheDocument();
  });

  it("shows the caller's note when the screen writes to the database", () => {
    render(<DropZone onFile={jest.fn()} note="Importar grava no banco" />);

    expect(screen.getByText("Importar grava no banco")).toBeInTheDocument();
  });
});
