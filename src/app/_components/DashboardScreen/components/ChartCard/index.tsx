import { SectionCard } from "@/components/SectionCard/index.tsx";
import { type ChartCardProps, useChartCard } from "./hook.ts";
import styles from "./style.module.scss";

// The SectionCard + measured-box wrapper both charts share. The height lives in
// style.module.scss only and is read back from the measurement, so there is no
// second copy of it in TypeScript to drift.
export function ChartCard(props: ChartCardProps) {
  const { title, icon, hint, legend, children, ref, size } =
    useChartCard(props);

  return (
    <SectionCard
      title={title}
      icon={icon}
      hint={hint}
      band="ink"
      headerEnd={legend}
    >
      <div ref={ref} className={styles.plot}>
        {size.width > 0 && size.height > 0 ? children(size) : null}
      </div>
    </SectionCard>
  );
}
