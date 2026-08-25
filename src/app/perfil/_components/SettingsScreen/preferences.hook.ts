import { useCallback, useEffect, useRef, useState } from "react";
import type { Settings } from "@/core/entities/settings.entity.ts";
import { ERROR_PREVIEW, previewFromDashboard } from "./headroom.helper.ts";
import {
  PREFS_COPY,
  prefsStatus,
  prefsStatusClass,
} from "./preferences-copy.ts";
import { prefsEdits } from "./preferences-edits.helper.ts";
import { fetchPrefs, storedOf } from "./preferences-io.helper.ts";
import { persistSettings } from "./preferences-persist.helper.ts";

export function usePreferences() {
  const [settings, setSettings] = useState<Settings>(storedOf(null));
  const [loaded, setLoaded] = useState<Settings | null>(null);
  const [preview, setPreview] = useState(ERROR_PREVIEW);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const gen = useRef(0);
  const settingsRef = useRef(settings);
  const loadedRef = useRef(loaded);
  settingsRef.current = settings;
  loadedRef.current = loaded;

  const persistBag = {
    gen,
    loadedRef,
    setSaving,
    setSaved,
    setError,
    setLoaded,
    setPreview,
  };

  const load = useCallback(() => {
    setLoading(true);
    setError(undefined);
    fetchPrefs().then(([row, dash]) => {
      setLoading(false);
      if (row.error) {
        setError(PREFS_COPY.loadError);
        setLoaded(null);
        return;
      }
      const stored = storedOf(row.data);
      setSettings(stored);
      setLoaded(stored);
      setPreview(previewFromDashboard(dash.data, Boolean(dash.error)));
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persist = (next: Settings) => persistSettings(next, persistBag);

  const edit = (patch: Partial<Settings>) => {
    const next = { ...settingsRef.current, ...patch };
    settingsRef.current = next;
    setSettings(next);
    setSaved(false);
    persist(next);
  };

  const onRetry = () => {
    if (loadedRef.current === null) {
      load();
      return;
    }
    persist(settingsRef.current);
  };

  return {
    settings,
    preview,
    ready: loaded !== null,
    loading,
    error,
    saving,
    statusMessage: prefsStatus(saving, saved),
    statusClass: prefsStatusClass(saving),
    onRetry,
    ...prefsEdits(edit, preview.maxCents),
  };
}
