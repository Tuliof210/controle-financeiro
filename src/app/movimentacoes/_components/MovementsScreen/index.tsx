"use client";

import { EntryScreen } from "@/components/EntryScreen/index.tsx";
import type { Movement } from "@/core/entities/movement.entity.ts";
import { formatYyyymm } from "@/lib/months.ts";
import { MovementForm } from "./components/MovementForm/index.tsx";
import type { MovementFormValues } from "./components/MovementForm/hook.ts";

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
        // "para este filtro", not "cadastrada ainda": the person <select>
        // filters client-side, so an empty section here is more often the
        // filter than an empty database.
        income: {
          add: "Adicionar entrada",
          emptyTitle: "Nenhuma entrada para este filtro",
          emptyHint:
            "Troque a pessoa selecionada ou registre a primeira entrada do período.",
        },
        expense: {
          add: "Adicionar saída",
          emptyTitle: "Nenhuma saída para este filtro",
          emptyHint: "Mês limpo — ou o filtro está estreito demais.",
        },
      }}
      renderPeriod={(movement) => formatYyyymm(movement.month)}
      form={MovementForm}
    />
  );
}
