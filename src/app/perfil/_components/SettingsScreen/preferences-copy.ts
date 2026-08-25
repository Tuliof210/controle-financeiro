export const PREFS_COPY = {
  loadError: "Não foi possível carregar os ajustes. Tente de novo.",
  saveError:
    "Não foi possível salvar os ajustes. Suas alterações ainda estão nesta tela — tente de novo.",
  saving: "Salvando ajustes…",
  saved: "Ajustes salvos.",
  loading: "Carregando ajustes…",
  retry: "Tentar de novo",
} as const;

export function prefsStatus(saving: boolean, saved: boolean): string {
  if (saving) {
    return PREFS_COPY.saving;
  }
  if (saved) {
    return PREFS_COPY.saved;
  }
  return "";
}

export function prefsStatusClass(saving: boolean): "loading" | "saved" {
  if (saving) {
    return "loading";
  }
  return "saved";
}
