"use client";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarRange,
  LayoutDashboard,
  Scale,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { formatYyyymm } from "@/lib/months";
import { Notice } from "./components/Notice";
import { StatCard } from "./components/StatCard";
import { HINTS } from "./hints";
import { useDashboardScreen } from "./hook";
import styles from "./style.module.scss";

export function DashboardScreen() {
  const { data, error, loading } = useDashboardScreen();

  return (
    <div className={styles.screen}>
      <h1 className={styles.eyebrow}>Dashboard</h1>

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
          Defina o período global em{" "}
          <Link href="/configuracoes">Configurações</Link> para visualizar a
          dashboard.
        </Notice>
      ) : null}

      {data?.status === "out_of_range" ? (
        <Notice title="Período global" icon={CalendarRange}>
          O período global ({formatYyyymm(data.range.start)}–
          {formatYyyymm(data.range.end)}) não cobre o mês atual (
          {formatYyyymm(data.range.current)}). Ajuste em{" "}
          <Link href="/configuracoes">Configurações</Link>.
        </Notice>
      ) : null}

      {data?.status === "ok" ? (
        <div className={styles.grid}>
          <StatCard
            title="Entradas"
            icon={ArrowDownCircle}
            tone="positive"
            hint={HINTS.income}
            stats={data.income}
          />
          <StatCard
            title="Saídas"
            icon={ArrowUpCircle}
            tone="negative"
            hint={HINTS.expense}
            stats={data.expense}
          />
          <StatCard
            title="Saldo"
            icon={Scale}
            hint={HINTS.balance}
            stats={data.balance}
            signed
          />
        </div>
      ) : null}
    </div>
  );
}
