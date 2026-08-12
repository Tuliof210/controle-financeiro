import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TypeToggle } from "@/components/EntryForm/components/TypeToggle/index.tsx";

describe("TypeToggle", () => {
  it("renders one button per entry type", () => {
    render(<TypeToggle value="income" onChange={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Entrada" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Saída" })).toBeInTheDocument();
  });

  it("reports the type that was picked", async () => {
    const onChange = jest.fn();
    render(<TypeToggle value="income" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Saída" }));

    expect(onChange).toHaveBeenCalledWith("expense");
  });
});
