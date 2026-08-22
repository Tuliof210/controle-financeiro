import { APP_ICONS } from "./icons-app.ts";
import { KIT_ICONS } from "./icons-kit.ts";

export const MV_ICONS = { ...KIT_ICONS, ...APP_ICONS };

export type MvIconName = keyof typeof MV_ICONS;
