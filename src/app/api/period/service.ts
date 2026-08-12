import { derivePeriod } from "@/core/use-cases/period.service.ts";
import { forecastRepository } from "@/infra/repositories/forecast.prisma.repository.ts";
import { movementRepository } from "@/infra/repositories/movement.prisma.repository.ts";

export async function getPeriod() {
  const [movements, forecasts] = await Promise.all([
    movementRepository.list(),
    forecastRepository.list(),
  ]);
  return derivePeriod(movements, forecasts);
}
