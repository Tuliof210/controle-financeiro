import { z } from "zod";
import { ENTRY_TYPES } from "./entry-types";

// The fields every movement carries, wherever it enters the system: one at a
// time through /api/movements, or a whole statement's worth through
// /api/ofx-imports. It lives here rather than in either route because a
// `route.ts` may only export HTTP handlers, and because two copies of `month`
// that must agree would eventually stop agreeing.
//
// `ownerId` is deliberately absent: /api/movements carries one per row, while
// an import carries one for the whole batch.
export const movementRowShape = {
  name: z.string().trim().min(1).max(80),
  valueCents: z.number().int().min(1),
  type: z.enum(ENTRY_TYPES),
  // 2000-2099: the picker's own domain — the derived period feeds buildMonths,
  // so a wider bound risks a corrupt row enumerating ~950k rows.
  month: z.number().int().min(200001).max(209912),
};

export const movementRowSchema = z.object(movementRowShape);

// The wire shape of one imported row. Derived from the schema above, so a
// bound and the type it validates can never drift apart.
export type MovementRow = z.infer<typeof movementRowSchema>;
