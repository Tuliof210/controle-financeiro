"use client";

import { EntryScreen } from "@/components/EntryScreen";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import { RecurrenceForm } from "./components/RecurrenceForm";
import type { RecurrenceFormValues } from "./components/RecurrenceForm/hook";
import { formatMonths } from "./recurrence-range.helper";

export function RecurrencesScreen() {
  return (
    <EntryScreen<Recurrence, RecurrenceFormValues>
      resource="recurrences"
      labels={{
        heading: "Recorrências",
        addTitle: "Adicionar recorrência",
        editTitle: "Editar recorrência",
        deleteTitle: "Excluir recorrência",
        empty: "Nenhuma recorrência cadastrada ainda.",
      }}
      renderPeriod={(recurrence) => formatMonths(recurrence.months)}
      Form={RecurrenceForm}
    />
  );
}
