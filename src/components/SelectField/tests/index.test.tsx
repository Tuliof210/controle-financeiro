import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { SelectField } from "@/components/SelectField/index.tsx";

const props = {
  id: "dono",
  label: "Dono",
  value: "p2",
  options: [
    { value: "p1", label: "Ana" },
    { value: "p2", label: "Bia" },
  ],
  onChange: jest.fn(),
};

describe("SelectField", () => {
  it("renders one option per entry, on the selected value", () => {
    render(<SelectField {...props} />);

    expect(screen.getByLabelText("Dono")).toHaveValue("p2");
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("names each option by its label", () => {
    render(<SelectField {...props} />);

    expect(screen.getByRole("option", { name: "Ana" })).toBeInTheDocument();
  });
});
