import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "@/components/PageHeader/index.tsx";

describe("PageHeader", () => {
  it("renders the title as the page heading, with eyebrow and subtitle", () => {
    render(
      <PageHeader
        eyebrow="Painel"
        title="Visão geral"
        subtitle="O mês em um olhar"
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Visão geral" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Painel")).toBeInTheDocument();
    expect(screen.getByText("O mês em um olhar")).toBeInTheDocument();
  });
});
