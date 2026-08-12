import "@testing-library/jest-dom/jest-globals";
import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalsSection } from "@/app/configuracoes/_components/SettingsScreen/components/GoalsSection/index.tsx";
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

const goal = { id: "g1", name: "Casa", targetCents: 5000 };

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(apiGet).mockResolvedValue({ data: [goal] } as never);
});

describe("GoalsSection", () => {
  it("lists the goals under its own card", async () => {
    render(<GoalsSection />);

    expect(
      screen.getByRole("heading", { name: "Objetivos" }),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Casa")).toBeInTheDocument());
  });

  it("says so when there is no goal yet", async () => {
    jest.mocked(apiGet).mockResolvedValue({ data: [] } as never);

    render(<GoalsSection />);

    await waitFor(() =>
      expect(
        screen.getByText("Nenhum objetivo cadastrado ainda."),
      ).toBeInTheDocument(),
    );
  });

  it("opens the add form", async () => {
    render(<GoalsSection />);

    await userEvent.click(
      screen.getByRole("button", { name: "Adicionar objetivo" }),
    );

    expect(screen.getByLabelText("Valor alvo")).toBeInTheDocument();
  });

  it("names the goal in the delete confirmation", async () => {
    render(<GoalsSection />);
    await waitFor(() => expect(screen.getByText("Casa")).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "Excluir Casa" }));

    expect(screen.getByText('Excluir o objetivo "Casa"?')).toBeInTheDocument();
  });
});
