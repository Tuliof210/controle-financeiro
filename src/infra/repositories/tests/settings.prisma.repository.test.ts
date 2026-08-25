/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { prisma } from "@/infra/db/client.ts";
import { settingsRepository } from "@/infra/repositories/settings.prisma.repository.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";

jest.mock("@/infra/db/client.ts", () => ({
  prisma: { settings: { findUnique: jest.fn(), upsert: jest.fn() } },
}));

const settings = jest.mocked(prisma.settings);

const select = {
  ceilingMode: true,
  ceilingPercent: true,
  ceilingCents: true,
  goalsMode: true,
  goalsPercent: true,
  goalsCents: true,
  showSimulated: true,
};

const row = { ...DEFAULT_SETTINGS, ceilingCents: 700 };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("settingsRepository", () => {
  it("reads the one singleton row, all seven fields", async () => {
    settings.findUnique.mockResolvedValue(row as never);

    await expect(settingsRepository.get()).resolves.toEqual(row);
    expect(settings.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select,
    });
  });

  it("narrows the two modes off the row's bare strings", async () => {
    settings.findUnique.mockResolvedValue({
      ...row,
      ceilingMode: "fixed",
      goalsMode: "fixed",
    } as never);

    const saved = await settingsRepository.get();

    expect(saved?.ceilingMode).toBe("fixed");
    expect(saved?.goalsMode).toBe("fixed");
  });

  it("passes an absent row through as null", async () => {
    settings.findUnique.mockResolvedValue(null);

    await expect(settingsRepository.get()).resolves.toBeNull();
  });

  it("upserts the whole object onto the same id, creating or updating", async () => {
    settings.upsert.mockResolvedValue(row as never);

    await expect(settingsRepository.save(row)).resolves.toEqual(row);

    expect(settings.upsert).toHaveBeenCalledWith({
      where: { id: 1 },
      create: { id: 1, ...row },
      update: row,
      select,
    });
  });
});
