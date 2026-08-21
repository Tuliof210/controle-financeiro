"use client";

import { CalendarRange, LayoutDashboard, TriangleAlert } from "lucide-react";
import type { DashboardData } from "@/app/api/dashboard/types.ts";
import { cx } from "@/lib/cx.ts";
import { formatYyyymm } from "@/lib/months.ts";
import { Board } from "./components/Board/index.tsx";
import { HeroBand } from "./components/HeroBand/index.tsx";
import { Notice } from "./components/Notice/index.tsx";
import { SimulationSelect } from "./components/SimulationSelect/index.tsx";
import { useDashboardScreen } from "./hook.ts";
import styles from "./style.module.scss";

const boardData = (data: DashboardData | null) => {
  if (data?.status === "ok") {
    return data;
  }
};

const COPY = {
  loading: "Somando lançamentos e compromissos do período…",
  noRange:
    "Nenhum lançamento ainda. Registre uma movimentação ou previsão para o período aparecer aqui.",
  outOfRangeLead: "O período global",
  outOfRangeMid: "não cobre o mês atual",
  outOfRangeTail:
    ". Registre uma movimentação ou previsão nesse mês para incluí-lo.",
} as const;

export function DashboardScreen() {
  const {
    data,
    error,
    loading,
    refreshing,
    cap,
    setCap,
    simulation,
    setSimulation,
  } = useDashboardScreen();
  // HeroBand takes the payload only when it is the 'ok' shape; every other
  // status leaves it undefined and the band renders its static half.
  const heroData = boardData(data);

  return (
    <div className={styles.screen}>
      {/* PageHeader's job on this route only. `data` only when the payload is
          ok — the title half renders in every state, so the page never opens on
          a bare notice. `refreshing` because the band sits OUTSIDE the wrapper
          that dims the board, and alone still claimed to be current. */}
      <HeroBand data={heroData} refreshing={refreshing} />

      {/* Under the band, not over it: the band is full-bleed and cancels
          <main>'s padding with a negative margin on all four sides, so anything
          placed above it gets overlapped by 16px (40px from `md` up). Here it
          sits where the figures it governs begin. Outside every status branch
          below, because reaching a range at all can be the reason someone turns
          simulations on — it must still be there on no_range/out_of_range. */}
      <SimulationSelect value={simulation} onChange={setSimulation} />

      {Boolean(loading) && (
        <Notice title="Carregando" icon={LayoutDashboard}>
          {COPY.loading}
        </Notice>
      )}

      {Boolean(error) && (
        <Notice title="Erro" icon={TriangleAlert}>
          {error}
        </Notice>
      )}

      {data?.status === "no_range" && (
        <Notice title="Período global" icon={CalendarRange}>
          {COPY.noRange}
        </Notice>
      )}

      {data?.status === "out_of_range" && (
        <Notice title="Período global" icon={CalendarRange}>
          {`${COPY.outOfRangeLead} (${formatYyyymm(data.range.start)}–${formatYyyymm(data.range.end)}) ${COPY.outOfRangeMid} (${formatYyyymm(data.range.current)})${COPY.outOfRangeTail}`}
        </Notice>
      )}

      {/* `aria-busy` and nothing else while a cap change is in flight: the board
          stays mounted and readable, so the only thing missing is the word that
          the figures are being replaced. The dimming is the visual half of the
          same statement. */}
      {data?.status === "ok" && (
        <div
          className={cx(refreshing && styles.refreshing)}
          aria-busy={refreshing}
        >
          <Board data={data} cap={cap} onCapChange={setCap} />
        </div>
      )}
    </div>
  );
}
