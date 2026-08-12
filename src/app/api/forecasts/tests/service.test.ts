/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  createForecast,
  deleteForecast,
  listForecasts,
  updateForecast,
} from "@/app/api/forecasts/service.ts";
import { forecastRepository } from "@/infra/repositories/forecast.prisma.repository.ts";

jest.mock("@/infra/repositories/forecast.prisma.repository.ts", () => ({
  forecastRepository: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const repository = jest.mocked(forecastRepository);

const input = {
  name: "Aluguel",
  valueCents: 150_000,
  type: "expense" as const,
  ownerId: "p1",
  months: [202_608],
  simulated: false,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("listForecasts", () => {
  it("hands the repository's list straight back", async () => {
    repository.list.mockResolvedValue([{ id: "f1" }] as never);

    await expect(listForecasts()).resolves.toEqual([{ id: "f1" }]);
  });
});

describe("createForecast", () => {
  it("passes the whole forecast through", async () => {
    repository.create.mockResolvedValue({ id: "f1" } as never);

    await expect(createForecast(input)).resolves.toEqual({ id: "f1" });
    expect(repository.create).toHaveBeenCalledWith(input);
  });
});

describe("updateForecast", () => {
  it("splits the id off the patch", async () => {
    repository.update.mockResolvedValue({ id: "f1" } as never);

    await updateForecast({ ...input, id: "f1" });

    expect(repository.update).toHaveBeenCalledWith("f1", input);
  });
});

describe("deleteForecast", () => {
  it("forwards the id", async () => {
    repository.delete.mockResolvedValue(undefined);

    await deleteForecast("f1");

    expect(repository.delete).toHaveBeenCalledWith("f1");
  });
});
