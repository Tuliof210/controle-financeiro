import { derivePeriod } from "@/core/use-cases/period.service";
import { forecastRepository } from "@/infra/repositories/forecast.prisma.repository";
import { movementRepository } from "@/infra/repositories/movement.prisma.repository";

export async function getPeriod() {
  const [movements, forecasts] = await Promise.all([
    movementRepository.list(),
    forecastRepository.list(),
  ]);
  return derivePeriod(movements, forecasts);
}
