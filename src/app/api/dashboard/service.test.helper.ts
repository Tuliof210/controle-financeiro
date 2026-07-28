import { vi } from "vitest";
import type { Goal } from "@/core/entities/goal.entity";
import type { Movement } from "@/core/entities/movement.entity";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import type { Settings } from "@/core/entities/settings.entity";
import { goalRepository } from "@/infra/repositories/goal.prisma.repository";
import { movementRepository } from "@/infra/repositories/movement.prisma.repository";
import { recurrenceRepository } from "@/infra/repositories/recurrence.prisma.repository";
import { settingsRepository } from "@/infra/repositories/settings.prisma.repository";

// Repository seeding for service.test.ts. Not a *.test.ts file, so Vitest does
// not collect it; the suite's vi.mock registrations still apply here, since
// they replace the module for the whole test module graph.

// getDashboard derives its period from the movements/recurrences lists below,
// not from Settings.
const DEFAULT_SETTINGS: Settings = {
  monthlyGoalCents: null,
};

type SeedInput = {
  settings?: Partial<Settings>;
  movements?: Movement[];
  recurrences?: Recurrence[];
  goals?: Omit<Goal, "createdAt">[];
};

export function seed({
  settings,
  movements = [],
  recurrences = [],
  goals = [],
}: SeedInput = {}) {
  vi.mocked(settingsRepository.get).mockResolvedValue({
    ...DEFAULT_SETTINGS,
    ...settings,
  });
  vi.mocked(movementRepository.list).mockResolvedValue(movements);
  vi.mocked(recurrenceRepository.list).mockResolvedValue(recurrences);
  vi.mocked(goalRepository.list).mockResolvedValue(
    goals.map((goal) => ({ ...goal, createdAt: new Date(0) })),
  );
}
