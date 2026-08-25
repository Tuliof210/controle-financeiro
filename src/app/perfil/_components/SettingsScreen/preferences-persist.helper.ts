import type { MutableRefObject } from "react";
import type { Settings } from "@/core/entities/settings.entity.ts";
import type { CeilingPreview } from "./headroom.helper.ts";
import { PREFS_COPY } from "./preferences-copy.ts";
import { putSettings, refreshPreview } from "./preferences-io.helper.ts";

export interface PersistBag {
  gen: MutableRefObject<number>;
  loadedRef: MutableRefObject<Settings | null>;
  setSaving: (value: boolean) => void;
  setSaved: (value: boolean) => void;
  setError: (value: string | undefined) => void;
  setLoaded: (value: Settings) => void;
  setPreview: (value: CeilingPreview) => void;
}

export async function persistSettings(next: Settings, bag: PersistBag) {
  if (bag.loadedRef.current === null) {
    return;
  }
  bag.gen.current += 1;
  const id = bag.gen.current;
  bag.setSaving(true);
  bag.setSaved(false);
  const result = await putSettings(next);
  if (id !== bag.gen.current) {
    return;
  }
  bag.setSaving(false);
  if (result.error) {
    bag.setError(PREFS_COPY.saveError);
    return;
  }
  bag.setError(undefined);
  bag.setLoaded(next);
  bag.loadedRef.current = next;
  bag.setSaved(true);
  const nextPreview = await refreshPreview();
  if (id !== bag.gen.current) {
    return;
  }
  bag.setPreview(nextPreview);
}
