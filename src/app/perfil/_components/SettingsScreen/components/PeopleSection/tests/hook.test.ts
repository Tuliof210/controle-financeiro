import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePeopleSection } from "@/app/perfil/_components/SettingsScreen/components/PeopleSection/hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";
import { apiGet, apiPost } from "@/lib/api.ts";

jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

const person = { id: "p1", name: "Ana", color: "violet" } as Person;
const draft = { name: "Ana", color: "violet" };

const mount = async () => {
  const rendered = renderHook(() => usePeopleSection());
  await waitFor(() => expect(rendered.result.current.people).toEqual([person]));
  return rendered;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(apiGet).mockResolvedValue({ data: [person] } as never);
  jest.mocked(apiPost).mockResolvedValue({ data: null });
});

describe("usePeopleSection", () => {
  it("lists the people on mount", async () => {
    const { result } = await mount();

    expect(result.current.modal).toBe("none");
  });

  it("reports a failed list", async () => {
    jest.mocked(apiGet).mockResolvedValue({ error: "Erro ao carregar" });

    const { result } = renderHook(() => usePeopleSection());

    await waitFor(() => expect(result.current.error).toBe("Erro ao carregar"));
  });

  it("opens each modal on its own person, then closes", async () => {
    const { result } = await mount();

    act(() => {
      result.current.openAdd();
    });
    expect(result.current.modal).toBe("add");
    expect(result.current.target).toBeUndefined();

    act(() => {
      result.current.openEdit(person);
    });
    expect(result.current).toMatchObject({ modal: "edit", target: person });

    act(() => {
      result.current.openDelete(person);
    });
    expect(result.current.modal).toBe("delete");

    act(() => {
      result.current.close();
    });
    expect(result.current.modal).toBe("none");
  });

  it("posts a new person and closes", async () => {
    const { result } = await mount();

    await act(async () => {
      await result.current.onAdd(draft);
    });

    expect(apiPost).toHaveBeenCalledWith("/api/people", draft);
    expect(result.current.modal).toBe("none");
  });

  it("keeps the modal open and reports a refused write", async () => {
    jest.mocked(apiPost).mockResolvedValue({ error: "Já existe" });
    const { result } = await mount();

    act(() => {
      result.current.openAdd();
    });
    await act(async () => {
      await result.current.onAdd(draft);
    });

    expect(result.current.error).toBe("Já existe");
    expect(result.current.modal).toBe("add");
  });
});
