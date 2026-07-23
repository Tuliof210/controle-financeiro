"use client";

import { useProfileSelect } from "./hook";
import styles from "./style.module.scss";

export function ProfileSelect() {
  const { profile, people, onChange } = useProfileSelect();

  return (
    <select
      aria-label="Perfil ativo"
      className={styles.select}
      value={profile}
      onChange={onChange}
    >
      <option value="familia">Família</option>
      {people.map((person) => (
        <option key={person.id} value={person.id}>
          {person.name}
        </option>
      ))}
    </select>
  );
}
