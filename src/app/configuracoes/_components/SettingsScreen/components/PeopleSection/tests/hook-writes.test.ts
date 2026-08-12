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

describe("usePeopleSection update and delete", () => {
  it("puts the edited person's id alongside the draft", async () => {
    const { result } = await mount();

    act(() => {
      result.current.openEdit(person);
    });
    await act(async () => {
      await result.current.onUpdate(draft);
    });

    expect(apiPut).toHaveBeenCalledWith("/api/people", {
      id: "p1",
      ...draft,
    });
  });

  it("ignores an update while nothing is being edited", async () => {
    const { result } = await mount();

    await act(async () => {
      await result.current.onUpdate(draft);
    });

    expect(apiPut).not.toHaveBeenCalled();
  });

  it("reports a refused update", async () => {
    jest.mocked(apiPut).mockResolvedValue({ error: "Já existe" });
    const { result } = await mount();

    act(() => {
      result.current.openEdit(person);
    });
    await act(async () => {
      await result.current.onUpdate(draft);
    });

    expect(result.current.error).toBe("Já existe");
  });
});
