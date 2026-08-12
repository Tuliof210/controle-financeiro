import type { MovementInput } from "@/core/repositories/movement.repository.ts";
import { movementRepository } from "@/infra/repositories/movement.prisma.repository.ts";

export function listMovements() {
  return movementRepository.list();
}

export function createMovement(input: MovementInput) {
  return movementRepository.create(input);
}

export function updateMovement(input: MovementInput & { id: string }) {
  const { id, ...patch } = input;
  return movementRepository.update(id, patch);
}

export function deleteMovement(id: string) {
  return movementRepository.delete(id);
}
