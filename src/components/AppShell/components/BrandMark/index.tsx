import { useBrandMark } from "./hook.ts";
import styles from "./style.module.scss";

// The Monevo mark: a four-column ascending bar chart in pixel blocks, tallest
// column capped by an accent block. The story's one inline SVG — lucide has no
// equivalent, and this is the product's own logo. `currentColor` everywhere but
// the cap, so the mark inherits whatever box it sits in.
export function BrandMark() {
  const { label } = useBrandMark();

  return (
    <span className={styles.box}>
      <svg
        width="21"
        height="21"
        viewBox="0 0 32 32"
        role="img"
        aria-label={label}
      >
        <rect x="1" y="25" width="6" height="4" rx="1" fill="currentColor" />
        <rect x="1" y="19.5" width="6" height="4" rx="1" fill="currentColor" />
        <rect x="1" y="14" width="6" height="4" rx="1" fill="currentColor" />
        <rect x="1" y="8.5" width="6" height="4" rx="1" fill="currentColor" />
        <rect x="9" y="25" width="6" height="4" rx="1" fill="currentColor" />
        <rect x="9" y="19.5" width="6" height="4" rx="1" fill="currentColor" />
        <rect x="17" y="25" width="6" height="4" rx="1" fill="currentColor" />
        <rect x="17" y="19.5" width="6" height="4" rx="1" fill="currentColor" />
        <rect x="17" y="14" width="6" height="4" rx="1" fill="currentColor" />
        <rect x="25" y="25" width="6" height="4" rx="1" fill="currentColor" />
        <rect x="25" y="19.5" width="6" height="4" rx="1" fill="currentColor" />
        <rect x="25" y="14" width="6" height="4" rx="1" fill="currentColor" />
        <rect x="25" y="8.5" width="6" height="4" rx="1" fill="currentColor" />
        <rect
          x="25"
          y="3"
          width="6"
          height="4"
          rx="1"
          fill="var(--color-accent)"
        />
      </svg>
    </span>
  );
}
