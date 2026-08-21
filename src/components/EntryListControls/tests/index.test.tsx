import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntryListControls } from "@/components/EntryListControls/index.tsx";
import { DEFAULT_ENTRY_LIST_QUERY } from "@/lib/entry-list-query.ts";

const kinds = [
  { value: "fixed", label: "Fixa" },
  { value: "commitment", label: "Compromisso futuro" },
];

const renderBar = (
  extra: Partial<Parameters<typeof EntryListControls>[0]> = {},
) => {
  const onChange = jest.fn();
  render(
    <EntryListControls
      query={DEFAULT_ENTRY_LIST_QUERY}
      onChange={onChange}
      {...extra}
    />,
  );
  return onChange;
};

describe("EntryListControls", () => {
  it("offers name, sort and direction, but no kind without options", () => {
    renderBar();

    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getByLabelText("Ordenar por")).toBeInTheDocument();
    expect(screen.getByLabelText("Direção")).toBeInTheDocument();
    expect(screen.queryByLabelText("Classificação")).not.toBeInTheDocument();
  });

  it("offers Classificação with Todas when kinds are passed", () => {
    renderBar({ kinds });

    expect(screen.getByLabelText("Classificação")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Todas" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Fixa" })).toBeInTheDocument();
  });

  it("reports a typed name", async () => {
    const onChange = renderBar();

    await userEvent.type(screen.getByLabelText("Nome"), "s");

    expect(onChange).toHaveBeenLastCalledWith({
      ...DEFAULT_ENTRY_LIST_QUERY,
      name: "s",
    });
  });

  it("reports a picked sort key", async () => {
    const onChange = renderBar();

    await userEvent.selectOptions(screen.getByLabelText("Ordenar por"), "name");

    expect(onChange).toHaveBeenLastCalledWith({
      ...DEFAULT_ENTRY_LIST_QUERY,
      sort: "name",
    });
  });
});
