"use client";

import { EntryScreen } from "@/components/EntryScreen/index.tsx";
import type { Forecast } from "@/core/entities/forecast.entity.ts";
import type { Period } from "@/core/use-cases/period.service.ts";
import { FORECAST_KINDS, KIND_LABELS } from "@/lib/forecast-kinds.ts";
import { CoverageBar } from "./components/CoverageBar/index.tsx";
import { ForecastBadges } from "./components/ForecastBadges/index.tsx";
import type { ForecastFormValues } from "./components/ForecastForm/hook.ts";
import { ForecastForm } from "./components/ForecastForm/index.tsx";
import { formatMonths } from "./forecast-range.helper.ts";

const renderPeriod = (forecast: Forecast) => formatMonths(forecast.months);

const renderBadges = (forecast: Forecast) => (
  <ForecastBadges kind={forecast.kind} simulated={forecast.simulated} />
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
      // Intervals on the metadata line, kind/simulated on their own row
      // under the name. EntryRow types its entry as `Entry` and cannot see
      // either field, so both slots are filled here.
      renderPeriod={renderPeriod}
      renderBadges={renderBadges}
      renderBand={renderBand}
      list={{
        getInitialDate: (forecast) => forecast.months[0] ?? 0,
        getCreatedAt: (forecast) => forecast.createdAt,
        getKind: (forecast) => forecast.kind,
        kinds: FORECAST_KINDS.map((value) => ({
          value,
          label: KIND_LABELS[value],
        })),
      }}
      form={ForecastForm}
    />
  );
}
