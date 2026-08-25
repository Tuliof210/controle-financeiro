import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalRow } from "@/app/perfil/_components/SettingsScreen/components/GoalsSection/components/GoalRow/index.tsx";
import type { Goal } from "@/core/entities/goal.entity.ts";

const goal = { id: "g1", name: "Casa", targetCents: 150_000 } as Goal;

describe("GoalRow", () => {
  it("shows the goal and its target", () => {
    render(<GoalRow goal={goal} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("Casa")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.500,00")).toBeInTheDocument();
  });

  it("names both actions after the goal", async () => {
    const onEdit = jest.fn();
    render(<GoalRow goal={goal} onEdit={onEdit} onDelete={jest.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Editar Casa" }));

    expect(onEdit).toHaveBeenCalledWith(goal);
    expect(
      screen.getByRole("button", { name: "Excluir Casa" }),
    ).toBeInTheDocument();
  });
});
