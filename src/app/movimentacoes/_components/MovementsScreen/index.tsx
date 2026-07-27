"use client";

import { EntryScreen } from "@/components/EntryScreen";
import type { Movement } from "@/core/entities/movement.entity";
import { formatYyyymm } from "@/lib/months";
import { MovementForm } from "./components/MovementForm";
import type { MovementFormValues } from "./components/MovementForm/hook";

export function MovementsScreen() {
  return (
    <EntryScreen<Movement, MovementFormValues>
      resource="movements"
      labels={{
        header: {
          eyebrow: "LANÇAMENTOS",
          title: "Movimentações",
          subtitle: "Entradas e saídas pontuais de cada pessoa da casa.",
        },
        addTitle: "Adicionar movimentação",
        editTitle: "Editar movimentação",
        deleteTitle: "Excluir movimentação",
        empty: "Nenhuma movimentação cadastrada ainda.",
      }}
      renderPeriod={(movement) => formatYyyymm(movement.month)}
      Form={MovementForm}
    />
  );
}
