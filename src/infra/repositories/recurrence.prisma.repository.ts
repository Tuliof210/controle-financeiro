import type { Recurrence } from "@/core/entities/recurrence.entity";
import type { RecurrenceRepository } from "@/core/repositories/recurrence.repository";
import { prisma } from "@/infra/db/client";

// Hand-written, not Prisma.RecurrenceGetPayload: a row carrying MORE fields
// than this still satisfies it, so any column the entity needs must be listed
// here too — otherwise it silently arrives undefined on every read.
type RecurrenceRow = {
  id: string;
  name: string;
  valueCents: number;
  type: string;
  kind: string;
  totalCents: number | null;
  ownerId: string;
  createdAt: Date;
  months: { month: number }[];
};

// ponytail: Prisma has no enum for `type`/`kind` (project convention — see
// schema comment), so a row sees `string`, not the domain union. Zod already
// guards both at the route boundary, so the narrowing casts here are safe.
function toEntity(row: RecurrenceRow): Recurrence {
  return {
    id: row.id,
    name: row.name,
    valueCents: row.valueCents,
    type: row.type as Recurrence["type"],
    kind: row.kind as Recurrence["kind"],
    totalCents: row.totalCents,
    ownerId: row.ownerId,
    months: row.months.map((m) => m.month).sort((a, b) => a - b),
    createdAt: row.createdAt,
  };
}

const monthRows = (months: number[]) => months.map((month) => ({ month }));

export const recurrenceRepository: RecurrenceRepository = {
  async list() {
    const rows = await prisma.recurrence.findMany({
      orderBy: { createdAt: "asc" },
      include: { months: true },
    });
    return rows.map(toEntity);
  },
  async create({ months, ...fields }) {
    const row = await prisma.recurrence.create({
      data: { ...fields, months: { create: monthRows(months) } },
      include: { months: true },
    });
    return toEntity(row);
  },
  async update(id, { months, ...fields }) {
    const row = await prisma.recurrence.update({
      where: { id },
      // Replace the whole set: clear existing months, then recreate.
      data: {
        ...fields,
        months: { deleteMany: {}, create: monthRows(months) },
      },
      include: { months: true },
    });
    return toEntity(row);
  },
  async delete(id) {
    await prisma.recurrence.delete({ where: { id } });
  },
};
