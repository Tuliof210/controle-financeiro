import type { SelectOption, SelectProps } from "@/components/Select/hook.ts";
import {
  ENTRY_SORT_KEYS,
  type EntryListQuery,
  type EntrySortDir,
  type EntrySortKey,
} from "@/lib/entry-list-query.ts";

interface EntryListControlsProps {
  query: EntryListQuery;
  onChange: (query: EntryListQuery) => void;
  kinds?: SelectOption[];
}

const COPY = {
  name: "Nome",
  namePlaceholder: "Buscar por nome",
  kind: "Classificação",
  all: "Todas",
  sort: "Ordenar por",
  dir: "Direção",
} as const;

const SORT_LABELS: Record<EntrySortKey, string> = {
  initialDate: "Data inicial",
  createdAt: "Data de criação",
  name: "Nome",
};

const DIR_KEYS = ["asc", "desc"] as const;
const DIR_LABELS: Record<EntrySortDir, string> = {
  asc: "Crescente",
  desc: "Decrescente",
};

function useEntryListControls({
  query,
  onChange,
  kinds,
}: EntryListControlsProps) {
  const patch = (next: Partial<EntryListQuery>) =>
    onChange({ ...query, ...next });

  let kind: SelectProps | undefined;
  if (kinds !== undefined) {
    kind = {
      id: "entry-list-kind",
      label: COPY.kind,
      value: query.kind,
      options: [{ value: "all", label: COPY.all }, ...kinds],
      onChange: (value) => patch({ kind: value }),
    };
  }

  return {
    name: {
      id: "entry-list-name",
      label: COPY.name,
      placeholder: COPY.namePlaceholder,
      value: query.name,
      onChange: (value: string) => patch({ name: value }),
    },
    kind,
    sort: {
      id: "entry-list-sort",
      label: COPY.sort,
      value: query.sort,
      options: ENTRY_SORT_KEYS.map((value) => ({
        value,
        label: SORT_LABELS[value],
      })),
      onChange: (value: string) => patch({ sort: value as EntrySortKey }),
    },
    dir: {
      id: "entry-list-dir",
      label: COPY.dir,
      value: query.dir,
      options: DIR_KEYS.map((value) => ({
        value,
        label: DIR_LABELS[value],
      })),
      onChange: (value: string) => patch({ dir: value as EntrySortDir }),
    },
  };
}

export type { EntryListControlsProps };
export { useEntryListControls };
