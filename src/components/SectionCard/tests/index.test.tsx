import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Wallet } from "lucide-react";
import { SectionCard } from "@/components/SectionCard/index.tsx";

describe("SectionCard", () => {
  it("renders the title as a heading over its body", () => {
    render(<SectionCard title="Saldo">conteúdo</SectionCard>);

    expect(screen.getByRole("heading", { name: "Saldo" })).toBeInTheDocument();
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("offers no hint affordance without a hint", () => {
    render(<SectionCard title="Saldo">x</SectionCard>);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("names the hint affordance after the card", () => {
    render(
      <SectionCard title="Teto" hint="Como o teto sai">
        x
      </SectionCard>,
    );

    expect(
      screen.getByRole("button", { name: "Como Teto é calculado" }),
    ).toBeInTheDocument();
  });

  it("renders the trailing header content when given", () => {
    render(
      <SectionCard title="Teto" band="brand" headerEnd={<span>badge</span>}>
        x
      </SectionCard>,
    );

    expect(screen.getByText("badge")).toBeInTheDocument();
  });

  it("renders the icon when given one", () => {
    const { container } = render(
      <SectionCard title="Saldo" icon={Wallet} tone="negative">
        x
      </SectionCard>,
    );

    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
