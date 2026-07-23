export type Recurrence = {
  id: string;
  name: string;
  valueCents: number;
  type: "income" | "expense";
  ownerId: string;
  rangeStart: number;
  rangeEnd: number;
  createdAt: Date;
};
