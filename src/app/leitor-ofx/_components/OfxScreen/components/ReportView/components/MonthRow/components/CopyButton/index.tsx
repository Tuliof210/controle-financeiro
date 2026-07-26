import { Check, Copy, X } from "lucide-react";
import { IconButton } from "@/components/IconButton";
import { type CopyButtonProps, useCopyButton } from "./hook";
import styles from "./style.module.scss";

const ICONS = { idle: Copy, done: Check, failed: X };

export function CopyButton(props: CopyButtonProps) {
  const { label, status, copy, announcement } = useCopyButton(props);
  const Icon = ICONS[status];

  return (
    <IconButton
      aria-label={label}
      variant={status === "failed" ? "danger" : "ghost"}
      onClick={copy}
    >
      <Icon size={16} aria-hidden />
      {/* A permanent child whose TEXT changes — a live region added to the DOM
          at the moment of the announcement is unreliably announced. The icon
          carries the same status, so nothing is colour-only. */}
      <span className={styles.sr} aria-live="polite">
        {announcement}
      </span>
    </IconButton>
  );
}
