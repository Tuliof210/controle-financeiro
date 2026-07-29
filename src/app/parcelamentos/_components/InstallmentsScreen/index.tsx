"use client";

import { PageHeader } from "@/components/PageHeader";
import { TabBar } from "@/components/TabBar";
import { PurchaseList } from "./components/PurchaseList";
import { useInstallmentsScreen } from "./hook";
import styles from "./style.module.scss";

export function InstallmentsScreen() {
  const { tab, tabs, onSelect, purchases, people, setModal } =
    useInstallmentsScreen();

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
    </div>
  );
}
