export type Movement = {
  id: string;
  name: string;
  valueCents: number;
  type: "income" | "expense";
  ownerId: string;
  month: number; // YYYYMM
  createdAt: Date;
};
