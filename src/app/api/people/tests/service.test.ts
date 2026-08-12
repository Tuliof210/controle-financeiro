/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  createPerson,
  deletePerson,
  listPeople,
  updatePerson,
} from "@/app/api/people/service.ts";
import { personRepository } from "@/infra/repositories/person.prisma.repository.ts";

// Relative, not "@/…": the SWC transform rewrites import specifiers but not
// this string, so an aliased path here would resolve to nothing. Same module.
jest.mock("../../../../infra/repositories/person.prisma.repository.ts", () => ({
  personRepository: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const repository = jest.mocked(personRepository);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("listPeople", () => {
  it("hands the repository's list straight back", async () => {
    repository.list.mockResolvedValue([{ id: "p1" }] as never);

    await expect(listPeople()).resolves.toEqual([{ id: "p1" }]);
  });
});

describe("createPerson", () => {
  it("passes name and colour through", async () => {
    repository.create.mockResolvedValue({ id: "p1" } as never);
    const input = { name: "Ana", color: "violet" };

    await expect(createPerson(input)).resolves.toEqual({ id: "p1" });
    expect(repository.create).toHaveBeenCalledWith(input);
  });
});

describe("updatePerson", () => {
  it("splits the id off the patch", async () => {
    repository.update.mockResolvedValue({ id: "p1" } as never);

    await updatePerson({ id: "p1", name: "Ana", color: "lime" });

    expect(repository.update).toHaveBeenCalledWith("p1", {
      name: "Ana",
      color: "lime",
    });
  });
});

describe("deletePerson", () => {
  it("forwards the id", async () => {
    repository.delete.mockResolvedValue(undefined);

    await deletePerson("p1");

    expect(repository.delete).toHaveBeenCalledWith("p1");
  });
});
