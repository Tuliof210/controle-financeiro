"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/Button";
import { IconButton } from "@/components/IconButton";
import { MonthPicker } from "@/components/MonthPicker";
import { type IntervalListProps, useIntervalList } from "./hook";
import styles from "./style.module.scss";

export function IntervalList(props: IntervalListProps) {
  const { intervals, canRemove, onStartChange, onEndChange, onAdd, onRemove } =
    useIntervalList(props);

  return (
    <div className={styles.list}>
      {intervals.map((interval, index) => (
        <div key={interval.key} className={styles.row}>
          <div className={styles.pickers}>
            <MonthPicker
              id={`forecast-interval-${interval.key}-start`}
              label="Início"
              value={interval.start}
              onChange={onStartChange(index)}
            />
            <MonthPicker
              id={`forecast-interval-${interval.key}-end`}
              label="Fim"
              value={interval.end}
              onChange={onEndChange(index)}
            />
          </div>
          {canRemove ? (
            <IconButton
              variant="danger"
              aria-label={`Remover intervalo ${index + 1}`}
              onClick={() => onRemove(index)}
            >
              <X size={16} aria-hidden />
            </IconButton>
          ) : null}
        </div>
      ))}
      <Button variant="ghost" onClick={onAdd}>
        <Plus size={16} aria-hidden /> Adicionar intervalo
      </Button>
    </div>
  );
}
