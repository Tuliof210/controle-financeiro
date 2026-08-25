// How a value is expressed: a share of what is available, or an amount in
// cents. Lives here and not in `src/lib/` because it is the domain of the
// adjustment itself, not a detail of transport — the route's
// `z.enum(SETTING_MODES)` reads from here, the way the dashboard route already
// reads `z.enum(SIMULATION_VIEWS)`.
export const SETTING_MODES = ["percent", "fixed"] as const;

export type SettingMode = (typeof SETTING_MODES)[number];

// No `id`: the row is a singleton pinned to 1 by the repository, so the
// identifier is a persistence detail no caller has any use for.
export interface Settings {
  ceilingMode: SettingMode;
  ceilingPercent: number; // 0..100
  ceilingCents: number; // 0..MAX_CENTS
  goalsMode: SettingMode;
  goalsPercent: number; // 0..100
  goalsCents: number;
  showSimulated: boolean;
}
