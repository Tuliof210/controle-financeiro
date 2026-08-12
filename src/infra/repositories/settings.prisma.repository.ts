import type { SettingsRepository } from "@/core/repositories/settings.repository.ts";
import { prisma } from "@/infra/db/client.ts";

// The whole singleton, in one constant. Every read and every write goes through
// this id, which is what keeps the table to one row without a DB constraint the
// Prisma schema could not describe.
const SETTINGS_ID = 1;

const shape = { monthlyGoalCents: true } as const;

export const settingsRepository: SettingsRepository = {
  get() {
    return prisma.settings.findUnique({
      where: { id: SETTINGS_ID },
      select: shape,
    });
  },
  save({ monthlyGoalCents }) {
    return prisma.settings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, monthlyGoalCents },
      update: { monthlyGoalCents },
      select: shape,
    });
  },
};
