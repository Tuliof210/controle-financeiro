import type { EntryType } from "@/lib/entry-types.ts";
import type { ForecastKind } from "@/lib/forecast-kinds.ts";

export interface Forecast {
  id: string;
  name: string;
  valueCents: number;
  type: EntryType;
  ownerId: string;
  months: number[]; // sorted, de-duped YYYYMM list of active months
  simulated: boolean; // a what-if the dashboard can be asked to leave out
  kind: ForecastKind; // fixed vs a future commitment; does not change projection
  createdAt: Date;
}
