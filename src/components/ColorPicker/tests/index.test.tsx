import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColorPicker } from "@/components/ColorPicker/index.tsx";
import { PALETTE } from "@/lib/palette.ts";

describe("ColorPicker", () => {
  it("renders the palette as a radio group", () => {
    render(<ColorPicker value="violet" onChange={jest.fn()} />);

    expect(screen.getByRole("radiogroup", { name: "Cor" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(PALETTE.length);
  });

  it("checks only the active colour", () => {
    render(<ColorPicker value="lime" onChange={jest.fn()} />);

    expect(screen.getByRole("radio", { name: "lime" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "violet" })).not.toBeChecked();
  });

  it("reports the colour that was picked", async () => {
    const onChange = jest.fn();
    render(<ColorPicker value="violet" onChange={onChange} />);

    await userEvent.click(screen.getByRole("radio", { name: "cyan" }));

    expect(onChange).toHaveBeenCalledWith("cyan");
  });
});
