import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { LoadingCard } from "@/app/leitor-ofx/_components/OfxScreen/components/LoadingCard/index.tsx";

describe("LoadingCard", () => {
  it("names the file it is reading", () => {
    render(<LoadingCard fileName="extrato.ofx" />);

    expect(
      screen.getByRole("heading", { name: "Lendo arquivo" }),
    ).toBeInTheDocument();
    expect(screen.getByText("extrato.ofx")).toBeInTheDocument();
  });

  it("announces an indeterminate progress bar", () => {
    render(<LoadingCard fileName="extrato.ofx" />);

    const bar = screen.getByRole("progressbar", { name: "Lendo o arquivo" });

    expect(bar).not.toHaveAttribute("aria-valuenow");
  });
});
