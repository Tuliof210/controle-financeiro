import type { Forecast } from "@/core/entities/forecast.entity";
import type { ForecastRepository } from "@/core/repositories/forecast.repository";
import { prisma } from "@/infra/db/client";

type ForecastRow = {
  id: string;
  name: string;
  valueCents: number;
  type: string;
  ownerId: string;
  createdAt: Date;
  months: { month: number }[];
};

// ponytail: Prisma has no enum for `type` (project convention — see schema
// comment), so a row sees `string`, not the domain union. Zod already guards it
// at the route boundary, so the narrowing cast here is safe.
function toEntity(row: ForecastRow): Forecast {
  return {
    id: row.id,
    name: row.name,
    valueCents: row.valueCents,
    type: row.type as Forecast["type"],
    ownerId: row.ownerId,
    months: row.months.map((m) => m.month).sort((a, b) => a - b),
    createdAt: row.createdAt,
  };
}

const monthRows = (months: number[]) => months.map((month) => ({ month }));

export const forecastRepository: ForecastRepository = {
  async list() {
    const rows = await prisma.forecast.findMany({
      orderBy: { createdAt: "asc" },
      include: { months: true },
    });
    return rows.map(toEntity);
  },
  async create({ months, ...fields }) {
    const row = await prisma.forecast.create({
      data: { ...fields, months: { create: monthRows(months) } },
      include: { months: true },
    });
    return toEntity(row);
  },
  async update(id, { months, ...fields }) {
    const row = await prisma.forecast.update({
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
    await prisma.forecast.delete({ where: { id } });
  },
};
