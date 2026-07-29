import { CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { SectionCard } from "@/components/SectionCard";
import { type MonthTotalsProps, useMonthTotals } from "./hook";
import styles from "./style.module.scss";

// Its own list rather than RowGrid: these rows have no owner chip and no
// actions, so two of RowGrid's four grid areas would sit empty and its two
// container-query tiers would be collapsing columns that are not there.
export function MonthTotals(props: MonthTotalsProps) {
  const { rows } = useMonthTotals(props);

  if (rows.length === 0) {
    return (
      <SectionCard title="Por mês" icon={CalendarClock} tone="negative">
        <EmptyState
          icon={CalendarClock}
          title="Nenhum mês comprometido"
          hint="Cadastre uma compra parcelada para ver o que cada mês já deve."
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Por mês" icon={CalendarClock} tone="negative">
      <ul className={styles.list}>
        {rows.map(({ month, label, count, total }) => (
          <li key={month} className={styles.row}>
            <span className={styles.month}>{label}</span>
            <span className={styles.count}>{count}</span>
            <span className={styles.total}>{total}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
