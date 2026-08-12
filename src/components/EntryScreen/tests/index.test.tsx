import "@testing-library/jest-dom/jest-globals";
import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntryScreen } from "@/components/EntryScreen/index.tsx";
import type {
  EntryScreenConfig,
  EntryScreenLabels,
} from "@/components/EntryScreen/types.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";
import type { Entry, EntryType } from "@/lib/entry-types.ts";
import { FAMILY_PROFILE } from "@/lib/ownership.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));
jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

interface Values {
  type: EntryType;
}

const config: EntryScreenConfig<Entry, Values> = {
  resource: "forecasts",
  labels: {
    header: {
      eyebrow: "Planejamento",
      title: "Previsões",
      subtitle: "O plano",
    },
    addTitle: "Nova previsão",
    editTitle: "Editar previsão",
    deleteTitle: "Excluir previsão",
    income: { add: "Nova entrada", emptyTitle: "Sem entradas", emptyHint: "a" },
    expense: { add: "Nova saída", emptyTitle: "Sem saídas", emptyHint: "b" },
  } as EntryScreenLabels,
  renderPeriod: () => null,
  form: () => null,
};

const entries = [
  { id: "e1", name: "Salário", valueCents: 100, type: "income", ownerId: "p1" },
  { id: "e2", name: "Luz", valueCents: 200, type: "expense", ownerId: "p2" },
] as Entry[];

const people = [{ id: "p1", name: "Ana" }];

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: {
    open: boolean;
  }) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: { open: boolean }) {
    this.open = false;
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useProfile).mockReturnValue({ profile: FAMILY_PROFILE } as never);
  jest.mocked(apiGet).mockImplementation((path: string) => {
    if (path.startsWith("/api/people")) {
      return Promise.resolve({ data: people }) as never;
    }
    if (path.startsWith("/api/period")) {
      return Promise.resolve({ data: null }) as never;
    }
    return Promise.resolve({ data: entries }) as never;
  });
});

describe("EntryScreen", () => {
  it("renders the header over both sections", async () => {
    render(<EntryScreen<Entry, Values> {...config} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Previsões" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("Salário")).toBeInTheDocument(),
    );
    expect(screen.getByText("Luz")).toBeInTheDocument();
  });

  it("names the entry in the delete confirmation", async () => {
    render(<EntryScreen<Entry, Values> {...config} />);
    await waitFor(() => expect(screen.getByText("Luz")).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "Excluir Luz" }));

    expect(screen.getByText('Excluir "Luz"?')).toBeInTheDocument();
  });
});
