"use client";

import { EntryScreen } from "@/components/EntryScreen/index.tsx";
import type { Forecast } from "@/core/entities/forecast.entity.ts";
import { CoverageBar } from "./components/CoverageBar/index.tsx";
import { ForecastForm } from "./components/ForecastForm/index.tsx";
import type { ForecastFormValues } from "./components/ForecastForm/hook.ts";
import { formatMonths } from "./forecast-range.helper.ts";
import styles from "./style.module.scss";

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
      //
      // The badge rides in here rather than in EntryRow because EntryRow types
      // its entry as the shared `Entry` and cannot see `simulated` at all. This
      // callback is the one place the item is known to be a Forecast, and it is
      // forecast-only code — Movimentações passes its own.
      renderPeriod={(forecast) => (
        <span className={styles.period}>
          {forecast.simulated ? (
            <span className={styles.badge}>Simulado</span>
          ) : null}
          <span className={styles.months}>{formatMonths(forecast.months)}</span>
        </span>
      )}
      renderBand={(forecast, period) =>
        period ? <CoverageBar months={forecast.months} period={period} /> : null
      }
      form={ForecastForm}
    />
  );
}
