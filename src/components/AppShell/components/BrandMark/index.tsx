import { useBrandMark } from "./hook.ts";
import styles from "./style.module.scss";

// Four rounded bars from design-system/assets/monevo-mark.svg. `currentColor`
// so the mark inherits the cobalt tile; the cap accent of the pixel-block mark
// is gone — the bars are the symbol.
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
        <title>{label}</title>
        <rect
          x="4.5"
          y="10"
          width="4.6"
          height="17"
          rx="2.3"
          fill="currentColor"
        />
        <rect
          x="11.5"
          y="18"
          width="4.6"
          height="9"
          rx="2.3"
          fill="currentColor"
        />
        <rect
          x="18"
          y="14"
          width="4.6"
          height="13"
          rx="2.3"
          fill="currentColor"
        />
        <rect
          x="24.9"
          y="5"
          width="4.6"
          height="22"
          rx="2.3"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}
