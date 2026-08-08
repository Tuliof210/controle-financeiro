import type { Settings } from "@/core/entities/settings.entity";

// `null` from get() means no goal has ever been saved — the state the Meta
// target reads as "not available". There is no delete(): clearing the goal is
// saving zero, which the Meta target already treats as unset.
export type SettingsRepository = {
  get(): Promise<Settings | null>;
  save(input: Settings): Promise<Settings>;
};
