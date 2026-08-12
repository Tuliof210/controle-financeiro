import { z } from "zod";
import { PALETTE } from "@/lib/palette.ts";

export const createSchema = z.object({
  name: z.string().trim().min(1).max(60),
  color: z.enum(PALETTE),
});

export const updateSchema = createSchema.extend({ id: z.string().min(1) });
