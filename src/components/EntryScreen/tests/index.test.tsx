import "@testing-library/jest-dom/jest-globals";
import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntryScreen } from "@/components/EntryScreen/index.tsx";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";
import type { Entry } from "@/lib/entry-types.ts";
import { FAMILY_PROFILE } from "@/lib/ownership.ts";
import { config, entries, people, type Values } from "./entry-screen-config.ts";

jest.mock("../../ProfileProvider/hook.ts", () => ({ useProfile: jest.fn() }));
jest.mock("../../../lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

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
