"use client";

import { CalendarRange, LayoutDashboard, TriangleAlert } from "lucide-react";
import { Button } from "@/components/Button/index.tsx";
import { cx } from "@/lib/cx.ts";
import { Board } from "./components/Board/index.tsx";
import { HeroBand } from "./components/HeroBand/index.tsx";
import { Notice } from "./components/Notice/index.tsx";
import { SimulationSelect } from "./components/SimulationSelect/index.tsx";
import { useDashboardScreen } from "./hook.ts";
import {
  NOTICE_COPY,
  okPayload,
  outOfRangeSentence,
} from "./notice-copy.helper.ts";
import styles from "./style.module.scss";

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
    retry,
  } = useDashboardScreen();
  // HeroBand takes the payload only when it is the 'ok' shape; every other
  // status leaves it undefined and the band renders its static half.
  const heroData = okPayload(data);

  return (
    <div className={styles.screen}>
      {/* PageHeader's job on this route only. Its copy moved into the band
          verbatim; the other five screens still render that component. The band
          takes `data` only when the payload is ok — its title half renders in
          every state, so the page never opens on a bare notice. */}
      <HeroBand data={heroData} />

      {/* Under the band, not over it: the band is full-bleed and cancels
          <main>'s padding with a negative margin on all four sides, so anything
          placed above it gets overlapped by 16px (40px from `md` up). Here it
          sits where the figures it governs begin. Outside every status branch
          below, because reaching a range at all can be the reason someone turns
          simulations on — it must still be there on no_range/out_of_range. */}
      <SimulationSelect value={simulation} onChange={setSimulation} />

      {Boolean(loading) && (
        <Notice title="Carregando" icon={LayoutDashboard} role="status">
          {NOTICE_COPY.loading}
        </Notice>
      )}

      {/* The one state that interrupts, and the only one with a way out: every
          other branch is information, but a failed fetch leaves the reader with
          nothing and no route back except reloading the page. */}
      {Boolean(error) && (
        <Notice
          title="Erro"
          icon={TriangleAlert}
          role="alert"
          action={<Button onClick={retry}>{NOTICE_COPY.retry}</Button>}
        >
          {error}
        </Notice>
      )}

      {data?.status === "no_range" && (
        <Notice title="Período global" icon={CalendarRange} role="status">
          {NOTICE_COPY.noRange}
        </Notice>
      )}

      {data?.status === "out_of_range" && (
        <Notice title="Período global" icon={CalendarRange} role="status">
          {outOfRangeSentence(data.range)}
        </Notice>
      )}

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
