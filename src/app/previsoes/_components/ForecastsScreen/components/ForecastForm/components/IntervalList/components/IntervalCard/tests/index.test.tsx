import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IntervalCard } from "@/app/previsoes/_components/ForecastsScreen/components/ForecastForm/components/IntervalList/components/IntervalCard/index.tsx";

const props = {
  index: 0,
  canRemove: true,
  onUpdate: jest.fn(),
  onRemove: jest.fn(),
};

const locked = { key: 0, start: 202_605, end: 202_605 };
const span = { key: 0, start: 202_601, end: 202_603 };

const REMOVE = /Remover/;

describe("IntervalCard", () => {
  it("shows one month picker while locked", () => {
    render(<IntervalCard {...props} interval={locked} />);

    expect(screen.getByLabelText("Mês - mês")).toBeInTheDocument();
    expect(screen.queryByLabelText("Início - mês")).not.toBeInTheDocument();
    expect(screen.getByText("Mai/26")).toBeInTheDocument();
  });

  it("shows both ends once unlocked", () => {
    render(<IntervalCard {...props} interval={span} />);

    expect(screen.getByLabelText("Início - mês")).toBeInTheDocument();
    expect(screen.getByLabelText("Fim - mês")).toBeInTheDocument();
    expect(screen.getByText("3 meses")).toBeInTheDocument();
  });

  it("checks the single-month box exactly while locked", () => {
    const { rerender } = render(<IntervalCard {...props} interval={locked} />);

    expect(screen.getByLabelText("Mês único")).toBeChecked();

    rerender(<IntervalCard {...props} interval={span} />);

    expect(screen.getByLabelText("Mês único")).not.toBeChecked();
  });

  it("offers the remove action only when a row may go", () => {
    const { rerender } = render(
      <IntervalCard {...props} interval={locked} canRemove={false} />,
    );

    expect(screen.queryByLabelText(REMOVE)).not.toBeInTheDocument();

    rerender(<IntervalCard {...props} interval={locked} />);

    expect(screen.getByLabelText("Remover intervalo 1")).toBeInTheDocument();
  });

  it("removes its own row", async () => {
    const onRemove = jest.fn();
    render(
      <IntervalCard
        {...props}
        interval={locked}
        index={2}
        onRemove={onRemove}
      />,
    );

    await userEvent.click(screen.getByLabelText("Remover intervalo 3"));

    expect(onRemove).toHaveBeenCalledWith(2);
  });
});
