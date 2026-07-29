"use client";

import { EntryScreen } from "@/components/EntryScreen";
import type { Forecast } from "@/core/entities/forecast.entity";
import { CoverageBar } from "./components/CoverageBar";
import { ForecastForm } from "./components/ForecastForm";
import type { ForecastFormValues } from "./components/ForecastForm/hook";
import { formatMonths } from "./forecast-range.helper";

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
      // The two halves of a forecast's period now land in two places: the
      // intervals read in the row's metadata line, the band under the row.
      renderPeriod={(forecast) => formatMonths(forecast.months)}
      renderBand={(forecast, period) =>
        period ? <CoverageBar months={forecast.months} period={period} /> : null
      }
      Form={ForecastForm}
    />
  );
}
