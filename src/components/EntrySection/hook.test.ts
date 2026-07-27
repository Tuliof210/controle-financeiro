import { TrendingDown } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import type { Person } from "@/core/entities/person.entity";
import type { Entry } from "@/lib/entry-types";
import { type EntrySectionProps, useEntrySection } from "./hook";

// useEntrySection calls no React hook, so it runs as a plain function here — no
// renderer and no jsdom needed.
const PERIOD = { start: 202601, end: 202612 };

const PEOPLE: Person[] = [
  { id: "p1", name: "Marina", color: "cyan", createdAt: new Date() },
];

const entry = (id: string, valueCents: number): Entry => ({
  id,
  name: `Item ${id}`,
  valueCents,
  type: "expense",
  ownerId: "p1",
});

const props = (
  over: Partial<EntrySectionProps<Entry>> = {},
): EntrySectionProps<Entry> => ({
  title: "Saídas",
  icon: TrendingDown,
  tone: "negative",
  items: [],
  people: PEOPLE,
  period: PERIOD,
  labels: {
    add: "Nova saída",
    emptyTitle: "Sem saídas",
    emptyHint: "Adicione a primeira.",
  },
  renderPeriod: () => null,
  onAdd: () => {},
  onEdit: () => {},
  onDelete: () => {},
  ...over,
});

describe("useEntrySection", () => {
  it("sums every item into the section total", () => {
    const { total } = useEntrySection(
      props({ items: [entry("a", 123456), entry("b", 654321), entry("c", 1)] }),
    );
    expect(total).toBe("R$ 7.777,78");
  });

  it("totals an empty section to zero", () => {
    expect(useEntrySection(props()).total).toBe("R$ 0,00");
  });

  it("hands renderPeriod the screen's period as its second argument", () => {
    const renderPeriod = vi.fn<EntrySectionProps<Entry>["renderPeriod"]>(
      () => null,
    );
    const item = entry("a", 100);

    useEntrySection(props({ items: [item], renderPeriod }));

    expect(renderPeriod).toHaveBeenCalledWith(item, PERIOD);
  });
});
