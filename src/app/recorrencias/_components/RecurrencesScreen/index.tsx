"use client";

import { EntryScreen } from "@/components/EntryScreen";
import type { Forecast } from "@/core/entities/forecast.entity";
import { CoverageBar } from "./components/CoverageBar";
import { RecurrenceForm } from "./components/RecurrenceForm";
import type { RecurrenceFormValues } from "./components/RecurrenceForm/hook";
import { formatMonths } from "./recurrence-range.helper";

export function RecurrencesScreen() {
  return (
    <EntryScreen<Forecast, RecurrenceFormValues>
      resource="forecasts"
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
      // The two halves of a recurrence's period now land in two places: the
      // intervals read in the row's metadata line, the band under the row.
      renderPeriod={(recurrence) => formatMonths(recurrence.months)}
      renderBand={(recurrence, period) =>
        period ? (
          <CoverageBar months={recurrence.months} period={period} />
        ) : null
      }
      Form={RecurrenceForm}
    />
  );
}
