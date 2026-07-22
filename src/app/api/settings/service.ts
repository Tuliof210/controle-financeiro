import type { Settings } from "@/core/entities/settings.entity";
import { settingsRepository } from "@/infra/repositories/settings.prisma.repository";

export function getSettings() {
  return settingsRepository.get();
}

export function saveSettings(patch: Partial<Settings>) {
  return settingsRepository.save(patch);
}
