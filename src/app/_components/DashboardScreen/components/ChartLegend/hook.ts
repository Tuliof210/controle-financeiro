export type LegendItem = { key: string; label: string; color: string };

export type ChartLegendProps = {
  // Colour swatches, for a chart whose series are told apart by fill.
  items?: LegendItem[];
  // A sentence instead, for a chart whose series are told apart by stroke —
  // there is no swatch that shows "dashed".
  note?: string;
};

export function useChartLegend({ items, note }: ChartLegendProps) {
  return { items: items ?? [], note };
}
