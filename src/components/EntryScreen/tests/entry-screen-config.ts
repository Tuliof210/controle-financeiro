import type { EntryScreenConfig } from "@/components/EntryScreen/types.ts";
import type { Entry, EntryType } from "@/lib/entry-types.ts";

// The fixture both EntryScreen suites drive. Not a `*.test.ts`, so testMatch
// leaves it alone.
interface Values {
  type: EntryType;
}

const labels = {
  header: { eyebrow: "Planejamento", title: "Previsões", subtitle: "O plano" },
  addTitle: "Nova previsão",
  editTitle: "Editar previsão",
  deleteTitle: "Excluir previsão",
  income: {
    add: "Nova entrada",
    emptyTitle: "Sem entradas",
    emptyHint: "Adicione",
  },
  expense: {
    add: "Nova saída",
    emptyTitle: "Sem saídas",
    emptyHint: "Adicione",
  },
};

const config: EntryScreenConfig<Entry, Values> = {
  resource: "forecasts",
  labels,
  renderPeriod: () => null,
  form: () => null,
};

const entries = [
  {
    id: "e1",
    name: "Salário",
    valueCents: 100,
    type: "income",
    ownerId: "p1",
  },
  { id: "e2", name: "Luz", valueCents: 200, type: "expense", ownerId: "p2" },
] as Entry[];

const people = [
  { id: "p1", name: "Ana" },
  { id: "p2", name: "Bia" },
];

export type { Values };
export { config, entries, labels, people };
