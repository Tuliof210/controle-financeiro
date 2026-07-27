"use client";

import { CalendarRange } from "lucide-react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { MonthPicker } from "@/components/MonthPicker";
import { SectionCard } from "@/components/SectionCard";
import { formatYyyymm } from "@/lib/months";
import { RangeTimeline } from "./components/RangeTimeline";
import { useRangeSection } from "./hook";
import styles from "./style.module.scss";

export function RangeSection() {
  const {
    rangeStart,
    setRangeStart,
    rangeEnd,
    setRangeEnd,
    savedRangeStart,
    savedRangeEnd,
    timeline,
    touched,
    error,
    open,
    openModal,
    closeModal,
    onSave,
  } = useRangeSection();

  const unset = savedRangeStart === null && savedRangeEnd === null;

  return (
    <SectionCard title="Período da projeção" icon={CalendarRange}>
      <div className={styles.row}>
        <p className={styles.summary}>
          {unset ? (
            "Nenhum período definido"
          ) : (
            <>
              {formatYyyymm(savedRangeStart)}{" "}
              <span className={styles.arrow}>→</span>{" "}
              {formatYyyymm(savedRangeEnd)}
            </>
          )}
        </p>
        <Button variant="ghost" onClick={openModal}>
          Editar
        </Button>
      </div>
      {timeline ? <RangeTimeline {...timeline} /> : null}
      <Modal
        open={open}
        onClose={closeModal}
        eyebrow="PERÍODO"
        title="Editar período da projeção"
        footer={
          <Button onClick={onSave} disabled={!touched}>
            Salvar
          </Button>
        }
      >
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
        {error ? (
          <p className={styles.error}>
            <span aria-hidden>▲</span> {error}
          </p>
        ) : null}
      </Modal>
    </SectionCard>
  );
}
