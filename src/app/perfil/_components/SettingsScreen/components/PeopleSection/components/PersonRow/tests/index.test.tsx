import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PersonRow } from "@/app/perfil/_components/SettingsScreen/components/PeopleSection/components/PersonRow/index.tsx";
import type { Person } from "@/core/entities/person.entity.ts";

const person = { id: "p1", name: "Ana", color: "violet" } as Person;

describe("PersonRow", () => {
  it("shows the name beside a decorative swatch", () => {
    const { container } = render(
      <PersonRow person={person} onEdit={jest.fn()} onDelete={jest.fn()} />,
    );

    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(container.querySelector('[data-cell="who"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("names both actions after the person", async () => {
    const onDelete = jest.fn();
    render(
      <PersonRow person={person} onEdit={jest.fn()} onDelete={onDelete} />,
    );

    expect(
      screen.getByRole("button", { name: "Editar Ana" }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Excluir Ana" }));

    expect(onDelete).toHaveBeenCalledWith(person);
  });
});
