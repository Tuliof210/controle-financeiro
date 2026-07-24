import { SectionCard } from "@/app/configuracoes/_components/SettingsScreen/components/SectionCard";
import { Button } from "@/components/Button";
import { RecurrenceRow } from "../RecurrenceRow";
import { type RecurrenceSectionProps, useRecurrenceSection } from "./hook";
import styles from "./style.module.scss";

export function RecurrenceSection(props: RecurrenceSectionProps) {
  const { title, icon, rows, onAdd } = useRecurrenceSection(props);

  return (
    <SectionCard title={title} icon={icon}>
      {rows.length === 0 ? (
        <p className={styles.empty}>Nenhuma recorrência cadastrada ainda.</p>
      ) : (
        <ul className={styles.list}>
          {rows.map(({ recurrence, person, onEdit, onDelete }) => (
            <RecurrenceRow
              key={recurrence.id}
              recurrence={recurrence}
              person={person}
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
