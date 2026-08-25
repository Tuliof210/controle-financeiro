import type { Settings } from "@/core/entities/settings.entity.ts";

// What "nothing saved yet" means, in one place. `settingsRepository.get()`
// answers `null` until the family saves for the first time, and both ends of
// the wire have to read that null the same way — the Perfil screen seeds its
// cards from here, the dashboard falls back to it.
//
// The values mirror the `@default` on every column of `model Settings`, and
// they reproduce the behaviour the board had while it carried its own controls:
// 50 was the default ceiling target, 25 the pace divisor, and simulations were
// left out. Zero on either cents field is how a fixed amount reads as unset.
export const DEFAULT_SETTINGS: Settings = {
  ceilingMode: "percent",
  ceilingPercent: 50,
  ceilingCents: 0,
  goalsMode: "percent",
  goalsPercent: 25,
  goalsCents: 0,
  showSimulated: false,
};
