import "@testing-library/jest-dom/jest-globals";
import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PeopleSection } from "@/app/configuracoes/_components/SettingsScreen/components/PeopleSection/index.tsx";
import { apiGet } from "@/lib/api.ts";

jest.mock("../../../../../../../lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

beforeAll(() => {
  // jsdom has no top layer, so the `open` attribute is driven by hand — without
  // it the dialog's content stays out of the accessibility tree.
  HTMLDialogElement.prototype.showModal = function showModal(this: {
    open: boolean;
  }) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: { open: boolean }) {
    this.open = false;
  };
});

const person = { id: "p1", name: "Ana", color: "violet" };

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(apiGet).mockResolvedValue({ data: [person] } as never);
});

describe("PeopleSection", () => {
  it("lists the people under its own card", async () => {
    render(<PeopleSection />);

    expect(
      screen.getByRole("heading", { name: "Pessoas" }),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Ana")).toBeInTheDocument());
  });

  it("says so when there is nobody yet", async () => {
    jest.mocked(apiGet).mockResolvedValue({ data: [] } as never);

    render(<PeopleSection />);

    await waitFor(() =>
      expect(
        screen.getByText("Nenhuma pessoa cadastrada ainda."),
      ).toBeInTheDocument(),
    );
  });

  it("opens the add form", async () => {
    render(<PeopleSection />);

    await userEvent.click(
      screen.getByRole("button", { name: "Adicionar pessoa" }),
    );

    expect(screen.getByRole("radiogroup", { name: "Cor" })).toBeInTheDocument();
  });

  it("names the person in the delete confirmation", async () => {
    render(<PeopleSection />);
    await waitFor(() => expect(screen.getByText("Ana")).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "Excluir Ana" }));

    expect(
      screen.getByText("Excluir Ana? Esta ação não pode ser desfeita."),
    ).toBeInTheDocument();
  });
});
