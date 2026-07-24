export type Recurrence = {
  id: string;
  name: string;
  valueCents: number;
  type: "income" | "expense";
  ownerId: string;
  months: number[]; // sorted, de-duped YYYYMM list of active months
  createdAt: Date;
};
