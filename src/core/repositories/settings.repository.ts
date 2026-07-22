import type { Settings } from "@/core/entities/settings.entity";

export type SettingsRepository = {
  get(): Promise<Settings>;
  save(patch: Partial<Settings>): Promise<Settings>;
};
