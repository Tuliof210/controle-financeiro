import { derivePeriod } from "@/core/use-cases/period.service";
import { movementRepository } from "@/infra/repositories/movement.prisma.repository";
import { recurrenceRepository } from "@/infra/repositories/recurrence.prisma.repository";

export async function getPeriod() {
  const [movements, recurrences] = await Promise.all([
    movementRepository.list(),
    recurrenceRepository.list(),
  ]);
  return derivePeriod(movements, recurrences);
}
