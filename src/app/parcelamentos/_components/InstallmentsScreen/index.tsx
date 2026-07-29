"use client";

import { PageHeader } from "@/components/PageHeader";
import { TabBar } from "@/components/TabBar";
import { PurchaseList } from "./components/PurchaseList";
import { PurchaseModals } from "./components/PurchaseModals";
import { useInstallmentsScreen } from "./hook";
import styles from "./style.module.scss";

export function InstallmentsScreen() {
  const {
    tab,
    tabs,
    onSelect,
    purchases,
    people,
    modal,
    setModal,
    close,
    error,
    onAdd,
    onUpdate,
    onConfirmDelete,
  } = useInstallmentsScreen();

  return (
    <div className={styles.screen}>
      <PageHeader
        eyebrow="A PRAZO"
        title="Parcelamentos"
        subtitle="Cada compra dividida, e o que ela deixa em cada mês à frente."
      />

      <TabBar tabs={tabs} onSelect={onSelect} label="Seções de parcelamentos" />

      {tab === "compras" ? (
        <PurchaseList
          purchases={purchases}
          people={people}
          onAdd={() => setModal({ type: "add" })}
          onEdit={(purchase) => setModal({ type: "edit", purchase })}
          onDelete={(purchase) => setModal({ type: "delete", purchase })}
        />
      ) : null}

      <PurchaseModals
        modal={modal}
        people={people}
        error={error}
        close={close}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onConfirmDelete={onConfirmDelete}
      />
    </div>
  );
}
