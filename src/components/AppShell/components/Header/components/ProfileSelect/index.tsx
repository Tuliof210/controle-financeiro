"use client";

import { FAMILY_PROFILE } from "@/lib/ownership.ts";
import { useProfileSelect } from "./hook.ts";
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
      <option value={FAMILY_PROFILE}>Família</option>
      {people.map((person) => (
        <option key={person.id} value={person.id}>
          {person.name}
        </option>
      ))}
    </select>
  );
}
