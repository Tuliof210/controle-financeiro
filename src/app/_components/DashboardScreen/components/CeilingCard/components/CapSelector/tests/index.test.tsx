import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CapSelector } from "@/app/_components/DashboardScreen/components/CeilingCard/components/CapSelector/index.tsx";

describe("CapSelector", () => {
  it("offers the three percentages while no goal is saved", () => {
    render(<CapSelector value="50" hasMeta={false} onChange={jest.fn()} />);

    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "50%" })).toBeChecked();
  });

  it("adds the Meta segment once there is a goal", () => {
    render(<CapSelector value="50" hasMeta={true} onChange={jest.fn()} />);

    expect(screen.getByRole("radio", { name: "Meta" })).toBeInTheDocument();
  });

  it("reports the target that was picked", async () => {
    const onChange = jest.fn();
    render(<CapSelector value="50" hasMeta={false} onChange={onChange} />);

    await userEvent.click(screen.getByRole("radio", { name: "75%" }));

    expect(onChange).toHaveBeenCalledWith("75");
  });
});
