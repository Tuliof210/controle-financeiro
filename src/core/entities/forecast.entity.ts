import type { EntryType } from "@/lib/entry-types.ts";

export interface Forecast {
  id: string;
  name: string;
  valueCents: number;
  type: EntryType;
  ownerId: string;
  months: number[]; // sorted, de-duped YYYYMM list of active months
  simulated: boolean; // a what-if the dashboard can be asked to leave out
  createdAt: Date;
}
