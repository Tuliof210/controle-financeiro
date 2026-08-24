"use client";

import { Icon } from "@/components/Icon/index.tsx";
import { CURRENCY_PREFIX } from "@/lib/glyphs.ts";
import { type FieldProps, useField } from "./hook.ts";
import styles from "./style.module.scss";

export function Field(props: FieldProps) {
  const view = useField(props);

  return (
    <div className={styles.field}>
      <label htmlFor={view.id} className={styles.label}>
        {view.label}
      </label>
      <div className={view.controlClass}>
        {view.iconLeft !== undefined && <Icon name={view.iconLeft} />}
        {view.isMoney === true && (
          <span className={styles.prefix} aria-hidden={true}>
            {CURRENCY_PREFIX}
          </span>
        )}
        <input
          ref={view.inputRef}
          id={view.id}
          className={styles.input}
          value={view.display}
          placeholder={view.placeholder}
          disabled={view.disabled}
          required={view.required}
          maxLength={view.maxLength}
          inputMode={view.inputMode}
          aria-invalid={view.invalid || undefined}
          aria-describedby={view.ariaDescribedBy}
          aria-label={view.ariaLabel}
          onChange={view.onChange}
          onFocus={view.onFocus}
          onSelect={view.onSelect}
        />
      </div>
      {Boolean(view.hint) && !view.invalid && (
        <p id={view.describedBy} className={styles.hint}>
          {view.hint}
        </p>
      )}
      {Boolean(view.error) && (
        <p id={view.describedBy} className={styles.error}>
          <Icon name="alertTriangle" /> {view.error}
        </p>
      )}
    </div>
  );
}
