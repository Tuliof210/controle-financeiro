"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/Button";
import { IntervalCard } from "./components/IntervalCard";
import { type IntervalListProps, useIntervalList } from "./hook";
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
