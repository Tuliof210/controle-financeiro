import type { Settings } from "@/core/entities/settings.entity";
import type { SettingsRepository } from "@/core/repositories/settings.repository";
import { prisma } from "@/infra/db/client";

function toEntity(row: Settings): Settings {
  return {
    monthlyGoalCents: row.monthlyGoalCents,
  };
}

export const settingsRepository: SettingsRepository = {
  async get() {
    const row = await prisma.settings.upsert({
      where: { id: 1 },
      create: { id: 1 },
      update: {},
    });
    return toEntity(row);
  },
  async save(patch) {
    const row = await prisma.settings.upsert({
      where: { id: 1 },
      create: { id: 1, ...patch },
      update: patch,
    });
    return toEntity(row);
  },
};
