import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TypeToggle } from "@/components/EntryForm/components/TypeToggle/index.tsx";

describe("TypeToggle", () => {
  it("renders a labelled radio per entry type, with the current one checked", () => {
    render(<TypeToggle value="income" onChange={jest.fn()} />);

    expect(screen.getByRole("group", { name: "Tipo" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Entrada" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Saída" })).not.toBeChecked();
  });

  it("reports the type that was picked", async () => {
    const onChange = jest.fn();
    render(<TypeToggle value="income" onChange={onChange} />);

    await userEvent.click(screen.getByRole("radio", { name: "Saída" }));

    expect(onChange).toHaveBeenCalledWith("expense");
  });
});
