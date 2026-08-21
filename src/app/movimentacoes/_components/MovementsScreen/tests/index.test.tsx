import "@testing-library/jest-dom/jest-globals";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { MovementsScreen } from "@/app/movimentacoes/_components/MovementsScreen/index.tsx";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));
jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

const movement = {
  id: "m1",
  name: "Mercado",
  valueCents: 1000,
  type: "expense",
  ownerId: "p1",
  month: 202_608,
};

beforeEach(() => {
  jest.mocked(useProfile).mockReturnValue({ profile: "familia" } as never);
  jest.mocked(apiGet).mockImplementation((path: string) => {
    if (path.startsWith("/api/movements")) {
      return Promise.resolve({ data: [movement] }) as never;
    }
    return Promise.resolve({ data: [] }) as never;
  });
});

describe("MovementsScreen", () => {
  it("titles the screen in pt-BR", () => {
    render(<MovementsScreen />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Movimentações" }),
    ).toBeInTheDocument();
  });

  it("renders a row's period as its single month", async () => {
    render(<MovementsScreen />);

    await waitFor(() =>
      expect(screen.getByText("Mercado")).toBeInTheDocument(),
    );
    expect(screen.getByText("Ago/26")).toBeInTheDocument();
  });

  it("blames the filter, not an empty database, when a section is empty", () => {
    render(<MovementsScreen />);

    expect(
      screen.getByText("Nenhuma entrada para este filtro"),
    ).toBeInTheDocument();
  });

  it("offers name, sort and direction, but not classification", () => {
    render(<MovementsScreen />);

    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getByLabelText("Ordenar por")).toBeInTheDocument();
    expect(screen.getByLabelText("Direção")).toBeInTheDocument();
    expect(screen.queryByLabelText("Classificação")).not.toBeInTheDocument();
  });
});
