import type { ForecastInput } from "@/core/repositories/forecast.repository.ts";
import { forecastRepository } from "@/infra/repositories/forecast.prisma.repository.ts";

export function listForecasts() {
  return forecastRepository.list();
}

export function createForecast(input: ForecastInput) {
  return forecastRepository.create(input);
}

export function updateForecast(input: ForecastInput & { id: string }) {
  const { id, ...patch } = input;
  return forecastRepository.update(id, patch);
}

export function deleteForecast(id: string) {
  return forecastRepository.delete(id);
}
