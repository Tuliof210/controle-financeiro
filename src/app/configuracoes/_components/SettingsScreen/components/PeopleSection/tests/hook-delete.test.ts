import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePeopleSection } from "@/app/configuracoes/_components/SettingsScreen/components/PeopleSection/hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";
import { apiDelete, apiGet, apiPut } from "@/lib/api.ts";

jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

const person = { id: "p1", name: "Ana", color: "violet" } as Person;
const draft = { name: "Ana", color: "lime" };

const mount = async () => {
  const rendered = renderHook(() => usePeopleSection());
  await waitFor(() => expect(rendered.result.current.people).toEqual([person]));
  return rendered;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(apiGet).mockResolvedValue({ data: [person] } as never);
  jest.mocked(apiPut).mockResolvedValue({ data: null });
  jest.mocked(apiDelete).mockResolvedValue({ data: null });
});

describe("usePeopleSection delete", () => {
  it("deletes by id, and only while a delete is pending", async () => {
    const { result } = await mount();

    await act(async () => {
      await result.current.onConfirmDelete();
    });
    expect(apiDelete).not.toHaveBeenCalled();

    act(() => {
      result.current.openDelete(person);
    });
    await act(async () => {
      await result.current.onConfirmDelete();
    });

    expect(apiDelete).toHaveBeenCalledWith("/api/people?id=p1");
  });

  it("reports a refused delete", async () => {
    jest.mocked(apiDelete).mockResolvedValue({ error: "Possui registros" });
    const { result } = await mount();

    act(() => {
      result.current.openDelete(person);
    });
    await act(async () => {
      await result.current.onConfirmDelete();
    });

    expect(result.current.error).toBe("Possui registros");
  });
});
