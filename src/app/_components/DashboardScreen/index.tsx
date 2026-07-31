"use client";

import { CalendarRange, LayoutDashboard, TriangleAlert } from "lucide-react";
import { formatYyyymm } from "@/lib/months";
import { Board } from "./components/Board";
import { HeroBand } from "./components/HeroBand";
import { Notice } from "./components/Notice";
import { useDashboardScreen } from "./hook";
import styles from "./style.module.scss";

export function DashboardScreen() {
  const { data, error, loading, refreshing, cap, setCap } =
    useDashboardScreen();

  return (
    <div className={styles.screen}>
      {/* PageHeader's job on this route only. Its copy moved into the band
          verbatim; the other five screens still render that component. The band
          takes `data` only when the payload is ok — its title half renders in
          every state, so the page never opens on a bare notice. */}
      <HeroBand data={data?.status === "ok" ? data : undefined} />

      {loading ? (
        <Notice title="Carregando" icon={LayoutDashboard}>
          Somando lançamentos e compromissos do período…
        </Notice>
      ) : null}

      {error ? (
        <Notice title="Erro" icon={TriangleAlert}>
          {error}
        </Notice>
      ) : null}

      {data?.status === "no_range" ? (
        <Notice title="Período global" icon={CalendarRange}>
          Nenhum lançamento ainda. Registre uma movimentação ou previsão para o
          período aparecer aqui.
        </Notice>
      ) : null}

      {data?.status === "out_of_range" ? (
        <Notice title="Período global" icon={CalendarRange}>
          O período global ({formatYyyymm(data.range.start)}–
          {formatYyyymm(data.range.end)}) não cobre o mês atual (
          {formatYyyymm(data.range.current)}). Registre uma movimentação ou
          previsão nesse mês para incluí-lo.
        </Notice>
      ) : null}

      {/* `aria-busy` and nothing else while a cap change is in flight: the board
          stays mounted and readable, so the only thing missing is the word that
          the figures are being replaced. The dimming is the visual half of the
          same statement. */}
      {data?.status === "ok" ? (
        <div
          className={refreshing ? styles.refreshing : undefined}
          aria-busy={refreshing}
        >
          <Board data={data} cap={cap} onCapChange={setCap} />
        </div>
      ) : null}
    </div>
  );
}
