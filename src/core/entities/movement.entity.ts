import type { EntryType } from "@/lib/entry-types";

export type Movement = {
  id: string;
  name: string;
  valueCents: number;
  type: EntryType;
  ownerId: string;
  month: number; // YYYYMM
  createdAt: Date;
};
