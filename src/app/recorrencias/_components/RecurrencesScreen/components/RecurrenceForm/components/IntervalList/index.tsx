"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/Button";
import { IconButton } from "@/components/IconButton";
import { type IntervalListProps, useIntervalList } from "./hook";
import styles from "./style.module.scss";

export function IntervalList(props: IntervalListProps) {
  const {
    rows,
    canRemove,
    canAdd,
    onStartChange,
    onEndChange,
    onAdd,
    onRemove,
  } = useIntervalList(props);

  return (
    <div className={styles.list}>
      {rows.map((row, index) => (
        <div key={row.key} className={styles.row}>
          <select
            className={styles.select}
            aria-label={`Início do intervalo ${index + 1}`}
            value={row.start}
            onChange={(event) =>
              onStartChange(index)(Number(event.target.value))
            }
          >
            {row.startOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className={styles.sep} aria-hidden>
            até
          </span>
          <select
            className={styles.select}
            aria-label={`Fim do intervalo ${index + 1}`}
            value={row.end}
            onChange={(event) => onEndChange(index)(Number(event.target.value))}
          >
            {row.endOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
      {canAdd ? (
        <Button variant="ghost" onClick={onAdd}>
          <Plus size={16} aria-hidden /> Adicionar intervalo
        </Button>
      ) : null}
    </div>
  );
}
