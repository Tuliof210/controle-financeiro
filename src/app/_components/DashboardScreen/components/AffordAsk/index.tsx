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
  const {
    amountCents,
    setAmountCents,
    answer,
    answerClass,
    fieldId,
    answerId,
  } = useAffordAsk(props);

  return (
    <SectionCard title={COPY.title} icon="banknote" hint={HINTS.afford}>
      <div className={styles.body}>
        <Field
          id={fieldId}
          label={COPY.label}
          money={true}
          value={amountCents}
          onChange={setAmountCents}
          describedBy={answerId}
        />
        {/* The field's description, not a live region: it changes on every
            keystroke, and announcing each intermediate figure buries the one
            the reader stopped on. The page already has HeroBand's status. */}
        {Boolean(answer) && (
          <p id={answerId} className={answerClass}>
            {answer}
          </p>
        )}
      </div>
    </SectionCard>
  );
}
