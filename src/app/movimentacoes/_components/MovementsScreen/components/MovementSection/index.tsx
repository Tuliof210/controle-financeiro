import { SectionCard } from "@/app/configuracoes/_components/SettingsScreen/components/SectionCard";
import { Button } from "@/components/Button";
import { MovementRow } from "../MovementRow";
import { type MovementSectionProps, useMovementSection } from "./hook";
import styles from "./style.module.scss";

export function MovementSection(props: MovementSectionProps) {
  const { title, icon, tone, rows, onAdd } = useMovementSection(props);

  return (
    <SectionCard title={title} icon={icon} tone={tone}>
      {rows.length === 0 ? (
        <p className={styles.empty}>Nenhuma movimentação cadastrada ainda.</p>
      ) : (
        <ul className={styles.list}>
          {rows.map(({ movement, person, onEdit, onDelete }) => (
            <MovementRow
              key={movement.id}
              movement={movement}
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
