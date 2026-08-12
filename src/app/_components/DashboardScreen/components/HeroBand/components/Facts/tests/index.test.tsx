import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Facts } from "@/app/_components/DashboardScreen/components/HeroBand/components/Facts/index.tsx";

describe("Facts", () => {
  it("pairs each label with its figure and its sub-line", () => {
    render(
      <Facts
        facts={[
          {
            key: "income",
            label: "ENTRADAS 3M",
            value: "R$ 30",
            sub: "média R$ 10/mês",
          },
        ]}
      />,
    );

    expect(screen.getByText("ENTRADAS 3M")).toBeInTheDocument();
    expect(screen.getByText("média R$ 10/mês")).toBeInTheDocument();
  });
});
