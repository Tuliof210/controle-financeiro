import type { Forecast } from "@/core/entities/forecast.entity.ts";
import type { EntryType } from "@/lib/entry-types.ts";

export interface ForecastInput {
  name: string;
  valueCents: number;
  type: EntryType;
  ownerId: string;
  months: number[]; // active YYYYMM months
  simulated: boolean;
}

export interface ForecastRepository {
  list: () => Promise<Forecast[]>;
  create: (input: ForecastInput) => Promise<Forecast>;
  update: (id: string, patch: ForecastInput) => Promise<Forecast>;
  delete: (id: string) => Promise<void>;
}
