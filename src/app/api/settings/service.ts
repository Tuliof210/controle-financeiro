import type { Settings } from "@/core/entities/settings.entity";
import { settingsRepository } from "@/infra/repositories/settings.prisma.repository";

// Pure delegation: the only rule this resource has is its schema, and that
// belongs at the handler's trust boundary rather than here.
export function getSettings() {
  return settingsRepository.get();
}

export function saveSettings(input: Settings) {
  return settingsRepository.save(input);
}
