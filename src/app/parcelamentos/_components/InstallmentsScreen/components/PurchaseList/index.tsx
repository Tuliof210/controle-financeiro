import { CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { EntryRow } from "@/components/EntryRow";
import { RowGrid } from "@/components/RowGrid";
import { SectionCard } from "@/components/SectionCard";
import { type PurchaseListProps, usePurchaseList } from "./hook";
import styles from "./style.module.scss";

export function PurchaseList(props: PurchaseListProps) {
  const { rows, onAdd } = usePurchaseList(props);

  return (
    <SectionCard title="Compras parceladas" icon={CreditCard} tone="negative">
      {rows.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Nenhuma compra parcelada"
          hint="Cadastre o valor total e o número de parcelas — o resto é conta nossa."
        />
      ) : (
        <RowGrid>
          {rows.map(({ purchase, person, period, total, onEdit, onDelete }) => (
            <EntryRow
              key={purchase.id}
              entry={purchase}
              person={person}
              period={period}
              band={<span className={styles.total}>Total {total}</span>}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </RowGrid>
      )}
      <Button variant="dashed" className={styles.add} onClick={onAdd}>
        <Plus size={16} aria-hidden /> Nova compra parcelada
      </Button>
    </SectionCard>
  );
}
