"use client";

import { CalendarRange, LayoutDashboard, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { formatYyyymm } from "@/lib/months";
import { Board } from "./components/Board";
import { Notice } from "./components/Notice";
import { useDashboardScreen } from "./hook";
import styles from "./style.module.scss";

export function DashboardScreen() {
  const { data, error, loading } = useDashboardScreen();

  return (
    <div className={styles.screen}>
      <PageHeader
        eyebrow="PAINEL"
        title="Dashboard"
        subtitle="Onde o dinheiro da família está hoje e para onde ele vai."
      />

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

      {data?.status === "ok" ? <Board data={data} /> : null}
    </div>
  );
}
