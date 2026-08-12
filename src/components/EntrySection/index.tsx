import { Plus } from "lucide-react";
import { Button } from "@/components/Button/index.tsx";
import { EntryRow } from "@/components/EntryRow/index.tsx";
import { RowGrid } from "@/components/RowGrid/index.tsx";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import type { Entry } from "@/lib/entry-types.ts";
import { EmptyState } from "./components/EmptyState/index.tsx";
import { type EntrySectionProps, useEntrySection } from "./hook.ts";
import styles from "./style.module.scss";

export function EntrySection<T extends Entry>(props: EntrySectionProps<T>) {
  const { title, icon, tone, rows, total, labels, onAdd } =
    useEntrySection(props);

  return (
    <SectionCard title={title} icon={icon} tone={tone}>
      {/* SectionCard takes no header slot, so the total is the body's first
          element with its own bottom rule — same reading, one fewer shared
          component touched. */}
      <p className={`${styles.total} ${styles[tone]}`}>{total}</p>
      {rows.length === 0 ? (
        <EmptyState
          icon={icon}
          title={labels.emptyTitle}
          hint={labels.emptyHint}
        />
      ) : (
        <RowGrid>
          {rows.map(({ entry, person, period, band, onEdit, onDelete }) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              person={person}
              period={period}
              band={band}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </RowGrid>
      )}
      <Button
        variant="dashed"
        className={`${styles.add} ${styles[tone]}`}
        onClick={onAdd}
      >
        <Plus size={16} aria-hidden={true} /> {labels.add}
      </Button>
    </SectionCard>
  );
}
