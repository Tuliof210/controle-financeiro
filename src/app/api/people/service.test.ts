import { describe, expect, it, vi } from "vitest";

vi.mock("@/infra/repositories/person.prisma.repository", () => ({
  personRepository: {
    list: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

import { personRepository } from "@/infra/repositories/person.prisma.repository";
import { createPerson, deletePerson, listPeople } from "./service";

describe("people service", () => {
  it("listPeople delegates to the repository", async () => {
    vi.mocked(personRepository.list).mockResolvedValue([]);
    await listPeople();
    expect(personRepository.list).toHaveBeenCalledOnce();
  });

  it("createPerson delegates to the repository with the given input", async () => {
    const input = { name: "Tulio", color: "violet" };
    vi.mocked(personRepository.create).mockResolvedValue({
      id: "1",
      ...input,
      createdAt: new Date(),
    });
    await createPerson(input);
    expect(personRepository.create).toHaveBeenCalledWith(input);
  });

  it("deletePerson delegates to the repository with the given id", async () => {
    await deletePerson("1");
    expect(personRepository.delete).toHaveBeenCalledWith("1");
  });
});
