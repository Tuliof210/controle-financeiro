import { Button } from "@/components/Button/index.tsx";
import { EntryRow } from "@/components/EntryRow/index.tsx";
import { RowGrid } from "@/components/RowGrid/index.tsx";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { cx } from "@/lib/cx.ts";
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
      <p className={cx(styles.total, tone && styles[tone])}>{total}</p>
      {rows.length === 0 && (
        <EmptyState
          icon={icon}
          title={labels.emptyTitle}
          hint={labels.emptyHint}
        />
      )}
      {rows.length > 0 && (
        <RowGrid>
          {rows.map(
            ({ entry, person, period, badges, band, onEdit, onDelete }) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                person={person}
                period={period}
                badges={badges}
                band={band}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ),
          )}
        </RowGrid>
      )}
      <Button variant="dashed" iconLeft="plus" onClick={onAdd}>
        {labels.add}
      </Button>
    </SectionCard>
  );
}
