"use client";

import { CalendarRange } from "lucide-react";
import { Button } from "@/components/Button";
import { MonthPicker } from "@/components/MonthPicker";
import { SectionCard } from "../SectionCard";
import { useRangeSection } from "./hook";
import { formatYyyymm } from "./range.helper";
import styles from "./style.module.scss";

export function RangeSection() {
  const {
    rangeStart,
    setRangeStart,
    rangeEnd,
    setRangeEnd,
    error,
    saved,
    onSave,
  } = useRangeSection();

  return (
    <SectionCard title="Range" icon={CalendarRange}>
      <p className={styles.summary}>
        {formatYyyymm(rangeStart)} → {formatYyyymm(rangeEnd)}
      </p>
      <div className={styles.pickers}>
        <MonthPicker
          id="range-start"
          label="Início"
          value={rangeStart}
          onChange={setRangeStart}
        />
        <MonthPicker
          id="range-end"
          label="Fim"
          value={rangeEnd}
          onChange={setRangeEnd}
        />
      </div>
      {error ? <p className={styles.error}>▲ {error}</p> : null}
      {saved ? <p className={styles.saved}>Salvo</p> : null}
      <Button onClick={onSave}>Salvar</Button>
    </SectionCard>
  );
}
