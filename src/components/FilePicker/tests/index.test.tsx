import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { FilePicker } from "@/components/FilePicker/index.tsx";

const FILE_LABEL = /arquivo/i;

describe("FilePicker", () => {
  it("leaves the button as the one reachable control", () => {
    render(<FilePicker label="Escolher arquivo" onFile={jest.fn()} />);

    expect(
      screen.getByRole("button", { name: "Escolher arquivo" }),
    ).toBeEnabled();
    expect(screen.queryByLabelText(FILE_LABEL)).not.toBeInTheDocument();
  });

  it("disables the button when asked", () => {
    render(
      <FilePicker label="Trocar arquivo" disabled={true} onFile={jest.fn()} />,
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
