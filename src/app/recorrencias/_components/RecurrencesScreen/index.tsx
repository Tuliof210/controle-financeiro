"use client";

import { EntryScreen } from "@/components/EntryScreen";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import { CoverageBar } from "./components/CoverageBar";
import { RecurrenceForm } from "./components/RecurrenceForm";
import type { RecurrenceFormValues } from "./components/RecurrenceForm/hook";

export function RecurrencesScreen() {
  return (
    <EntryScreen<Recurrence, RecurrenceFormValues>
      resource="recurrences"
      labels={{
        header: {
          eyebrow: "AUTOMÁTICO",
          title: "Recorrências",
          subtitle: "O que se repete todo mês — a base de toda a projeção.",
        },
        addTitle: "Adicionar recorrência",
        editTitle: "Editar recorrência",
        deleteTitle: "Excluir recorrência",
        income: {
          add: "Nova recorrência",
          emptyTitle: "Sem entradas recorrentes",
          emptyHint:
            "Cadastre salário ou renda fixa para a projeção ficar precisa.",
        },
        expense: {
          add: "Nova recorrência",
          emptyTitle: "Sem saídas recorrentes",
          emptyHint: "Aluguel, financiamento e assinaturas entram aqui.",
        },
      }}
      renderPeriod={(recurrence, period) => (
        <CoverageBar months={recurrence.months} period={period} />
      )}
      Form={RecurrenceForm}
    />
  );
}
