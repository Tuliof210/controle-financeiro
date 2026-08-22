import { Card } from "@/components/Card/index.tsx";
import { Delta } from "@/components/Delta/index.tsx";
import { Icon } from "@/components/Icon/index.tsx";
import { MoneyDisplay } from "@/components/MoneyDisplay/index.tsx";
import { Tooltip } from "@/components/Tooltip/index.tsx";
import { cx } from "@/lib/cx.ts";
import { SPARK_H, SPARK_W } from "../../spark.helper.ts";
import { Headline } from "../Headline/index.tsx";
import { type StatCardProps, useStatCard } from "./hook.ts";
import styles from "./style.module.scss";

const CHIP_CLASS = {
  positive: styles.chipPositive,
  negative: styles.chipNeutral,
  brand: styles.chipBrand,
} as const;

export function StatCard(props: StatCardProps) {
  const { title, icon, hint, chip, signed, total, tone, rows, spark, color } =
    useStatCard(props);

  return (
    <Card as="section" variant="elevated" padding="lg" className={styles.card}>
      <div className={styles.header}>
        <span className={cx(styles.chip, CHIP_CLASS[chip])}>
          <Icon name={icon} size={16} />
        </span>
        <h2 className={styles.title}>{title}</h2>
        <Tooltip text={hint} label={`Como ${title} é calculado`} />
      </div>

      <div className={styles.body}>
        <Headline caption="Valor total no período" tone={tone}>
          {signed && (
            <span className={styles.sign} aria-hidden={true}>
              <Delta value={total} money={true} />
            </span>
          )}
          <MoneyDisplay value={total} variant="large" />
        </Headline>

        <dl className={styles.rows}>
          {rows.map((row) => (
            <div className={styles.row} key={row.key}>
              <dt className={styles.label}>{row.label}</dt>
              <dd className={styles.value}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {spark !== null && (
        <svg
          width={SPARK_W}
          height={SPARK_H}
          viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
          className={styles.spark}
        >
          <path
            d={spark.area}
            fill={color}
            opacity="var(--opacity-data-wash)"
          />
          <path
            d={spark.line}
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </Card>
  );
}
