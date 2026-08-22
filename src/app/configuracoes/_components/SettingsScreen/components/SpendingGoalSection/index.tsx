"use client";

import { Button } from "@/components/Button/index.tsx";
import { Field } from "@/components/Field/index.tsx";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { onSubmitForm } from "@/lib/form.helper.ts";
import { ERROR_GLYPH } from "@/lib/glyphs.ts";
import { useSpendingGoalSection } from "./hook.ts";
import styles from "./style.module.scss";

const CENTS_ID = "spending-goal";

const COPY = {
  meta: "Meta",
  quantoVocePretende:
    "Quanto você pretende gastar por mês. Com ela salva, o Teto de Gastos ganha o alvo",
  queLiberaEste:
    ", que libera este valor ou o teto do mês — o que for menor. Zero desliga o alvo.",
  salvar: "Salvar",
} as const;

export function SpendingGoalSection() {
  const { cents, error, onChange, onSave, savedMessage } =
    useSpendingGoalSection();

  return (
    <SectionCard title="Meta mensal" icon="wallet">
      <p className={styles.help}>
        {COPY.quantoVocePretende} <strong>{COPY.meta}</strong>
        {COPY.queLiberaEste}
      </p>
      <form className={styles.form} onSubmit={onSubmitForm(onSave)}>
        <Field
          money={true}
          id={CENTS_ID}
          label="Meta mensal"
          value={cents}
          onChange={onChange}
        />
        {Boolean(error) && (
          <p className={styles.error} role="alert">
            <span aria-hidden={true}>{ERROR_GLYPH}</span> {error}
          </p>
        )}
        <Button type="submit">{COPY.salvar}</Button>
        {/* Always rendered, empty until a save lands: a live region announces a
            text change, not its own insertion. */}
        <p className={styles.saved} role="status">
          {savedMessage}
        </p>
      </form>
    </SectionCard>
  );
}
