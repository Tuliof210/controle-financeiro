import { goalRepository } from "@/infra/repositories/goal.prisma.repository";

export function listGoals() {
  return goalRepository.list();
}

export function createGoal(input: { name: string; targetCents: number }) {
  return goalRepository.create(input);
}

export function deleteGoal(id: string) {
  return goalRepository.delete(id);
}
