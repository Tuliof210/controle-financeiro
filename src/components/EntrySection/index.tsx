import { SectionCard } from "@/app/configuracoes/_components/SettingsScreen/components/SectionCard";
import { Button } from "@/components/Button";
import { EntryRow } from "@/components/EntryRow";
import type { Entry } from "@/lib/entry-types";
import { type EntrySectionProps, useEntrySection } from "./hook";
import styles from "./style.module.scss";

export function EntrySection<T extends Entry>(props: EntrySectionProps<T>) {
  const { title, icon, tone, rows, empty, onAdd } = useEntrySection(props);

  return (
    <SectionCard title={title} icon={icon} tone={tone}>
      {rows.length === 0 ? (
        <p className={styles.empty}>{empty}</p>
      ) : (
        <ul className={styles.list}>
          {rows.map(({ entry, person, period, onEdit, onDelete }) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              person={person}
              period={period}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
      <Button onClick={onAdd}>Adicionar</Button>
    </SectionCard>
  );
}
