import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IntervalList } from "@/app/previsoes/_components/ForecastsScreen/components/ForecastForm/components/IntervalList/index.tsx";

const row = (key: number) => ({ key, start: 202_601, end: 202_601 });

const props = {
  onUpdate: jest.fn(),
  onAdd: jest.fn(),
  onRemove: jest.fn(),
};

const REMOVE = /Remover/;

describe("IntervalList", () => {
  it("renders one card per interval", () => {
    render(<IntervalList {...props} intervals={[row(0), row(1)]} />);

    expect(screen.getAllByLabelText("Mês único")).toHaveLength(2);
  });

  it("hides removal while a single interval is left", () => {
    render(<IntervalList {...props} intervals={[row(0)]} />);

    expect(screen.queryByLabelText(REMOVE)).not.toBeInTheDocument();
  });

  it("adds an interval", async () => {
    const onAdd = jest.fn();
    render(<IntervalList {...props} intervals={[row(0)]} onAdd={onAdd} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Adicionar intervalo" }),
    );

    expect(onAdd).toHaveBeenCalled();
  });
});
