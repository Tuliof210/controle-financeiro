import type {
  SettingMode,
  Settings,
} from "@/core/entities/settings.entity.ts";
import type { SettingsRepository } from "@/core/repositories/settings.repository.ts";
import { prisma } from "@/infra/db/client.ts";

// The whole singleton, in one constant. Every read and every write goes through
// this id, which is what keeps the table to one row without a DB constraint the
// Prisma schema could not describe.
const SETTINGS_ID = 1;

// One shape for the select and, spread below, for the write: the save is
// all-or-nothing — there is no PATCH — so create and update carry the same
// seven fields and cannot fall out of step.
const shape = {
  ceilingMode: true,
  ceilingPercent: true,
  ceilingCents: true,
  goalsMode: true,
  goalsPercent: true,
  goalsCents: true,
  showSimulated: true,
} as const;

type SettingsRow = Omit<Settings, "ceilingMode" | "goalsMode"> & {
  ceilingMode: string;
  goalsMode: string;
};

// ponytail: Prisma has no enum for the two modes (project convention — see the
// schema comment), so a row sees `string`, not the domain union. Zod already
// guards them at the route boundary, so the narrowing cast here is safe. Same
// shape as forecast.prisma.repository's toEntity, for the same reason.
const toEntity = (row: SettingsRow): Settings => ({
  ...row,
  ceilingMode: row.ceilingMode as SettingMode,
  goalsMode: row.goalsMode as SettingMode,
});

export const settingsRepository: SettingsRepository = {
  async get() {
    const row = await prisma.settings.findUnique({
      where: { id: SETTINGS_ID },
      select: shape,
    });
    // `null` stays `null`: it is the never-saved state, and the reader is what
    // applies DEFAULT_SETTINGS. Answering a default object from here would
    // erase the distinction the Perfil screen depends on.
    if (row === null) {
      return null;
    }
    return toEntity(row);
  },
  async save(input) {
    const row = await prisma.settings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...input },
      update: input,
      select: shape,
    });
    return toEntity(row);
  },
};
