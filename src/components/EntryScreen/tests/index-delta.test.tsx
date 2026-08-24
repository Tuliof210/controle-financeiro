import "@testing-library/jest-dom/jest-globals";
import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntryScreen } from "@/components/EntryScreen/index.tsx";
import type {
  EntryScreenConfig,
  EntryScreenLabels,
} from "@/components/EntryScreen/types.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet, apiPost } from "@/lib/api.ts";
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
// A module-level handler keeps the stub button's prop identity stable.
let submitLatest: (values: Values) => void = () => undefined;
const clickSubmit = () => submitLatest({ type: "income" });
const config: EntryScreenConfig<Entry, Values> = {
  resource: "forecasts",
  labels: {
    header: { title: "Previsões", subtitle: "O plano" },
    addTitle: "Nova previsão",
    income: { add: "Nova entrada", emptyTitle: "Sem entradas", emptyHint: "a" },
    expense: { add: "Nova saída", emptyTitle: "Sem saídas", emptyHint: "b" },
  } as EntryScreenLabels,
  renderPeriod: () => null,
  form: ({ onSubmit }) => {
    submitLatest = onSubmit;
    return (
      <button type="button" onClick={clickSubmit}>
        Confirmar
      </button>
    );
  },
  list: { getInitialDate: () => 0, getCreatedAt: () => "" },
};
const entries = [
  { id: "e1", name: "Salário", valueCents: 100, type: "income", ownerId: "p1" },
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
  localStorage.clear();
  jest.mocked(useProfile).mockReturnValue({ profile: FAMILY_PROFILE } as never);
  let monthly = 250;
  jest.mocked(apiGet).mockImplementation((path: string) => {
    if (path.startsWith("/api/dashboard")) {
      return Promise.resolve({
        data: { status: "ok", ceiling: { monthly } },
      }) as never;
    }
    if (path.startsWith("/api/people")) {
      return Promise.resolve({ data: people }) as never;
    }
    if (path.startsWith("/api/period")) {
      return Promise.resolve({ data: null }) as never;
    }
    return Promise.resolve({ data: entries }) as never;
  });
  jest.mocked(apiPost).mockImplementation(() => {
    monthly = 100;
    return Promise.resolve({ data: null });
  });
});

describe("EntryScreen ceiling delta", () => {
  it("shows both monthly ceilings after a successful save", async () => {
    render(<EntryScreen<Entry, Values> {...config} />);
    expect(await screen.findByText("Salário")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Nova entrada" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Teto deste mês: R$ 2,50 → R$ 1,00.",
    );
  });
});
