import { z } from "zod";
import { RECURRENCE_KINDS } from "@/core/entities/recurrence.entity";
import { ENTRY_TYPES } from "@/lib/entry-types";

// Split out of route.ts only because two more fields no longer fit there under
// the 100-line cap. The route stays the trust boundary; this is its shape.
const recurrenceShape = {
  name: z.string().trim().min(1).max(80),
  valueCents: z.number().int().min(1),
  type: z.enum(ENTRY_TYPES),
  // Omitted means fixed, so every caller written before installments existed
  // keeps working — the e2e seed posts three bodies with no kind at all.
  kind: z.enum(RECURRENCE_KINDS).default("fixed"),
  // Display-only: never checked against valueCents * months.length, because
  // the parcel is rounded up and the residue is deliberate.
  totalCents: z.number().int().min(1).nullish(),
  ownerId: z.string().min(1),
  // At least one active month; deduped and sorted so storage is canonical.
  // 2000-2099: the picker's own domain — the derived period feeds
  // buildMonths, so a wider bound risks a corrupt row enumerating ~950k rows.
  months: z
    .array(z.number().int().min(200001).max(209912))
    .min(1)
    .transform((m) => [...new Set(m)].sort((a, b) => a - b)),
};

export const createSchema = z.object(recurrenceShape);
export const updateSchema = z.object({
  ...recurrenceShape,
  id: z.string().min(1),
});
