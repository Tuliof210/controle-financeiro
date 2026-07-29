import type { Forecast } from "@/core/entities/forecast.entity";
import type { EntryType } from "@/lib/entry-types";

export type ForecastInput = {
  name: string;
  valueCents: number;
  type: EntryType;
  ownerId: string;
  months: number[]; // active YYYYMM months
};

export type ForecastRepository = {
  list(): Promise<Forecast[]>;
  create(input: ForecastInput): Promise<Forecast>;
  update(id: string, patch: ForecastInput): Promise<Forecast>;
  delete(id: string): Promise<void>;
};
