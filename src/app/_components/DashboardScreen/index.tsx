"use client";

import { cx } from "@/lib/cx.ts";
import { useCapAnnouncement } from "./cap-announce.hook.ts";
import { Board } from "./components/Board/index.tsx";
import { HeroBand } from "./components/HeroBand/index.tsx";
import { ScreenNotices } from "./components/ScreenNotices/index.tsx";
import { SimulationSelect } from "./components/SimulationSelect/index.tsx";
import { useDashboardScreen } from "./hook.ts";
import { okPayload } from "./notice-copy.helper.ts";
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
  const announcement = useCapAnnouncement(heroData, refreshing);

  return (
    <div className={styles.screen}>
      {/* PageHeader's job on this route only. Its copy moved into the band
          verbatim; the other five screens still render that component. The band
          takes `data` only when the payload is ok — its title half renders in
          every state, so the page never opens on a bare notice. */}
      <HeroBand data={heroData} cap={cap} />

      {/* Under the band, not over it: the band is full-bleed and cancels
          <main>'s padding with a negative margin on all four sides, so anything
          placed above it gets overlapped by 16px (40px from `md` up). Here it
          sits where the figures it governs begin. Outside every status branch
          below, because reaching a range at all can be the reason someone turns
          simulations on — it must still be there on no_range/out_of_range. */}
      <SimulationSelect value={simulation} onChange={setSimulation} />

      {/* The word the dimmed board never said. Outside every status branch: it
          reports on figures still on screen, so it must not unmount with them. */}
      <p className={styles.announcer} role="status" aria-live="polite">
        {announcement}
      </p>

      <ScreenNotices
        loading={loading}
        error={error}
        data={data}
        onRetry={retry}
      />

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
