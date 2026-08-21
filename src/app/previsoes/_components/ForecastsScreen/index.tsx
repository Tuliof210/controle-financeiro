"use client";

import { EntryScreen } from "@/components/EntryScreen/index.tsx";
import type { Forecast } from "@/core/entities/forecast.entity.ts";
import type { Period } from "@/core/use-cases/period.service.ts";
import { KIND_LABELS } from "@/lib/forecast-kinds.ts";
import { CoverageBar } from "./components/CoverageBar/index.tsx";
import type { ForecastFormValues } from "./components/ForecastForm/hook.ts";
import { ForecastForm } from "./components/ForecastForm/index.tsx";
import { formatMonths } from "./forecast-range.helper.ts";
import styles from "./style.module.scss";

const COPY = {
  simulado: "Simulado",
} as const;

// The badges ride here rather than in EntryRow because EntryRow types its
// entry as the shared `Entry` and cannot see `kind` or `simulated` at all.
const renderPeriod = (forecast: Forecast) => (
  <span className={styles.period}>
    <span className={styles.badge}>{KIND_LABELS[forecast.kind]}</span>
    {Boolean(forecast.simulated) && (
      <span className={styles.badge}>{COPY.simulado}</span>
    )}
    <span className={styles.months}>{formatMonths(forecast.months)}</span>
  </span>
);

const renderBand = (forecast: Forecast, period: Period | null) => {
  if (period === null) {
    return null;
  }
  return <CoverageBar months={forecast.months} period={period} />;
};

export function ForecastsScreen() {
  return (
    <EntryScreen<Forecast, ForecastFormValues>
      resource="forecasts"
      labels={{
        header: {
          eyebrow: "AUTOMÁTICO",
          title: "Previsões",
          subtitle: "O que você espera todo mês — a base de toda a projeção.",
        },
        addTitle: "Adicionar previsão",
        editTitle: "Editar previsão",
        deleteTitle: "Excluir previsão",
        income: {
          add: "Nova previsão",
          emptyTitle: "Sem previsão de entrada",
          emptyHint:
            "Cadastre salário ou renda fixa para a projeção ficar precisa.",
        },
        expense: {
          add: "Nova previsão",
          emptyTitle: "Sem previsão de saída",
          emptyHint: "Aluguel, financiamento e assinaturas entram aqui.",
        },
      }}
      // Intervals in the row's metadata line, the band under the row. Kind and
      // simulated badges ride here: EntryRow types its entry as `Entry`.
      renderPeriod={renderPeriod}
      renderBand={renderBand}
      form={ForecastForm}
    />
  );
}
