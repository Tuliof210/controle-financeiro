import { Card } from "@/components/Card/index.tsx";
import { Icon } from "@/components/Icon/index.tsx";
import { Tooltip } from "@/components/Tooltip/index.tsx";
import {
  type BandTone,
  type SectionCardProps,
  useSectionCard,
} from "./hook.ts";
import styles from "./style.module.scss";

// An explicit map, not `styles[band]`: the tone lookup two lines down is already
// the kind that dies silently when a class is renamed, and one of those in this
// file is enough.
const BAND_CLASS: Record<BandTone, string> = {
  positive: styles.bandPositive,
  negative: styles.bandNegative,
  brand: styles.bandBrand,
  ink: styles.bandInk,
};

export function SectionCard(props: SectionCardProps) {
  const { title, icon, tone, hint, headerEnd, band, children } =
    useSectionCard(props);
  const titleRowClassName = [
    styles.titleRow,
    tone && styles[tone],
    band && styles.band,
    band && BAND_CLASS[band],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card
      as="section"
      variant={band ? "elevated" : "flat"}
      padding="lg"
      className={styles.card}
    >
      <div className={titleRowClassName}>
        {/* 16, not 18: the title next to it is now a --text-2xs eyebrow. */}
        {icon !== undefined && <Icon name={icon} size={16} />}
        <h2 className={styles.title}>{title}</h2>
        {/* Named after the card: a dashboard renders many of these, and a
            generic label would list them all identically to a screen reader. */}
        {hint !== undefined && (
          <Tooltip text={hint} label={`Como ${title} é calculado`} />
        )}
        {Boolean(headerEnd) && (
          <div className={styles.headerEnd}>{headerEnd}</div>
        )}
      </div>
      <div className={styles.body}>{children}</div>
    </Card>
  );
}
