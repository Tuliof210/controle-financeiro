"use client";

import { Field } from "@/components/Field/index.tsx";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { HINTS } from "../../hints.ts";
import { type AffordAskProps, useAffordAsk } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  title: "Posso gastar?",
  label: "Valor",
} as const;

export function AffordAsk(props: AffordAskProps) {
  const { amountCents, setAmountCents, answer, tone, fieldId } =
    useAffordAsk(props);

  return (
    <SectionCard title={COPY.title} icon="banknote" hint={HINTS.afford}>
      <div className={styles.body}>
        <Field
          id={fieldId}
          label={COPY.label}
          money={true}
          value={amountCents}
          onChange={setAmountCents}
        />
        {Boolean(answer) && (
          <p className={styles[tone ?? "fits"]} role="status">
            {answer}
          </p>
        )}
      </div>
    </SectionCard>
  );
}
