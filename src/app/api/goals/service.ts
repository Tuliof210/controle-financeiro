import { goalRepository } from "@/infra/repositories/goal.prisma.repository.ts";

export function listGoals() {
  return goalRepository.list();
}

export function createGoal(input: { name: string; targetCents: number }) {
  return goalRepository.create(input);
}

export function updateGoal(input: {
  id: string;
  name: string;
  targetCents: number;
}) {
  const { id, ...patch } = input;
  return goalRepository.update(id, patch);
}

export function deleteGoal(id: string) {
  return goalRepository.delete(id);
}
