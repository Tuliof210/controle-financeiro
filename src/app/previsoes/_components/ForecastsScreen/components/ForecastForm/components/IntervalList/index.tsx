"use client";

import { Button } from "@/components/Button/index.tsx";
import { IntervalCard } from "./components/IntervalCard/index.tsx";
import { type IntervalListProps, useIntervalList } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  adicionarIntervalo: "Adicionar intervalo",
} as const;

export function IntervalList(props: IntervalListProps) {
  const { intervals, canRemove, onUpdate, onAdd, onRemove } =
    useIntervalList(props);

  return (
    <div className={styles.list}>
      {intervals.map((interval, index) => (
        <IntervalCard
          key={interval.key}
          interval={interval}
          index={index}
          canRemove={canRemove}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
      <Button variant="dashed" onClick={onAdd} iconLeft="plus">
        {COPY.adicionarIntervalo}
      </Button>
    </div>
  );
}
