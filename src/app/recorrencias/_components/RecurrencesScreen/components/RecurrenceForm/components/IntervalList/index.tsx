"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/Button";
import { IconButton } from "@/components/IconButton";
import { MonthRangeSlider } from "../MonthRangeSlider";
import { type IntervalListProps, useIntervalList } from "./hook";
import styles from "./style.module.scss";

export function IntervalList(props: IntervalListProps) {
  const { months, intervals, canRemove, onSliderChange, onAdd, onRemove } =
    useIntervalList(props);

  return (
    <div className={styles.list}>
      {intervals.map((interval, index) => (
        <div key={interval.key} className={styles.row}>
          <MonthRangeSlider
            months={months}
            rangeStart={interval.start}
            rangeEnd={interval.end}
            onChange={onSliderChange(index)}
          />
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
