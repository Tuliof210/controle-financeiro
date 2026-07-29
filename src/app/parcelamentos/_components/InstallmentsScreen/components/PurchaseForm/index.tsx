"use client";

import { Button } from "@/components/Button";
import { MoneyInput } from "@/components/MoneyInput";
import { MonthPicker } from "@/components/MonthPicker";
import { SelectField } from "@/components/SelectField";
import { TextField } from "@/components/TextField";
import { type PurchaseFormProps, usePurchaseForm } from "./hook";
import styles from "./style.module.scss";

// Composed field by field rather than through the shared EntryForm: two of its
// six controls are constants here (always Saída, always a purchase), and its
// MoneyInput means the per-month value, while the one below means the price.
export function PurchaseForm(props: PurchaseFormProps) {
  const {
    name,
    setName,
    totalCents,
    setTotalCents,
    parcels,
    setParcels,
    firstMonth,
    setFirstMonth,
    ownerId,
    setOwnerId,
    people,
    parcelOptions,
    preview,
    canSubmit,
    submitLabel,
    error,
    handleSubmit,
  } = usePurchaseForm(props);

  return (
    <div className={styles.form}>
      <TextField
        id="purchase-name"
        label="O que você comprou"
        value={name}
        onChange={setName}
      />
      <MoneyInput
        valueCents={totalCents}
        onChange={setTotalCents}
        ariaLabel="Valor total da compra"
      />
      <SelectField
        id="purchase-parcels"
        label="Parcelas"
        value={String(parcels)}
        onChange={(value) => setParcels(Number(value))}
        options={parcelOptions.map((count) => ({
          value: count,
          label: `${count}x`,
        }))}
      />
      <MonthPicker
        id="purchase-first-month"
        label="Primeira parcela"
        value={firstMonth}
        onChange={setFirstMonth}
      />
      <SelectField
        id="purchase-owner"
        label="Responsável"
        value={ownerId}
        onChange={setOwnerId}
        options={people.map((person) => ({
          value: person.id,
          label: person.name,
        }))}
      />
      {preview ? <p className={styles.preview}>{preview}</p> : null}
      {error ? (
        <p className={styles.error}>
          <span aria-hidden>▲</span> {error}
        </p>
      ) : null}
      <Button onClick={handleSubmit} disabled={!canSubmit}>
        {submitLabel}
      </Button>
    </div>
  );
}
