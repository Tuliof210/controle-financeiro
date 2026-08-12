"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/Button/index.tsx";
import { IntervalCard } from "./components/IntervalCard/index.tsx";
import { type IntervalListProps, useIntervalList } from "./hook.ts";
import styles from "./style.module.scss";

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
      <Button variant="dashed" onClick={onAdd}>
        <Plus size={16} aria-hidden /> Adicionar intervalo
      </Button>
    </div>
  );
}
