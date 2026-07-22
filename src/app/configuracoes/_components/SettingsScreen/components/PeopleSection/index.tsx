"use client";

import { Users } from "lucide-react";
import { Button } from "@/components/Button";
import { ColorPicker } from "@/components/ColorPicker";
import { TextField } from "@/components/TextField";
import { SectionCard } from "../SectionCard";
import { usePeopleSection } from "./hook";
import styles from "./style.module.scss";

export function PeopleSection() {
  const { people, name, setName, color, setColor, error, onAdd, onDelete } =
    usePeopleSection();

  return (
    <SectionCard title="Pessoas" icon={Users}>
      {people?.length === 0 ? (
        <p className={styles.empty}>Nenhuma pessoa cadastrada ainda.</p>
      ) : (
        <ul className={styles.list}>
          {people?.map((person) => (
            <li key={person.id} className={styles.row}>
              <span
                className={`${styles.swatch} ${styles[person.color]}`}
                aria-hidden
              />
              <span className={styles.name}>{person.name}</span>
              <Button variant="danger" onClick={() => onDelete(person.id)}>
                Remover
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.form}>
        <TextField
          id="person-name"
          label="Nome"
          value={name}
          onChange={setName}
          error={error}
        />
        <ColorPicker value={color} onChange={setColor} />
        <Button onClick={onAdd}>Adicionar</Button>
      </div>
    </SectionCard>
  );
}
