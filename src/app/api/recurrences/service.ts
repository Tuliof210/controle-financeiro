import type { RecurrenceInput } from "@/core/repositories/recurrence.repository";
import { recurrenceRepository } from "@/infra/repositories/recurrence.prisma.repository";

export function listRecurrences() {
  return recurrenceRepository.list();
}

export function createRecurrence(input: RecurrenceInput) {
  return recurrenceRepository.create(input);
}

export function updateRecurrence(input: RecurrenceInput & { id: string }) {
  const { id, ...patch } = input;
  return recurrenceRepository.update(id, patch);
}

export function deleteRecurrence(id: string) {
  return recurrenceRepository.delete(id);
}
