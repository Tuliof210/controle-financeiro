import { z } from "zod";
import { ENTRY_TYPES } from "@/lib/entry-types.ts";

const NAME_MAX = 80;
// 2000-2099: the picker's own domain.
const MONTH_MIN = 200_001;
const MONTH_MAX = 209_912;

const forecastShape = {
  name: z.string().trim().min(1).max(NAME_MAX),
  valueCents: z.number().int().min(1),
  type: z.enum(ENTRY_TYPES),
  ownerId: z.string().min(1),
  // At least one active month; deduped and sorted so storage is canonical.
  // 2000-2099: the picker's own domain — the derived period feeds
  // buildMonths, so a wider bound risks a corrupt row enumerating ~950k rows.
  months: z
    .array(z.number().int().min(MONTH_MIN).max(MONTH_MAX))
    .min(1)
    .transform((m) => [...new Set(m)].sort((a, b) => a - b)),
  // Defaulted rather than required: a body that predates simulations — the e2e
  // seeds, a saved curl — is a real forecast, not a validation error.
  simulated: z.boolean().default(false),
};

export const createSchema = z.object(forecastShape);
export const updateSchema = z.object({
  ...forecastShape,
  id: z.string().min(1),
});
