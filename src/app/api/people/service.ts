import { personRepository } from "@/infra/repositories/person.prisma.repository.ts";

export function listPeople() {
  return personRepository.list();
}

export function createPerson(input: { name: string; color: string }) {
  return personRepository.create(input);
}

export function updatePerson(input: {
  id: string;
  name: string;
  color: string;
}) {
  const { id, ...patch } = input;
  return personRepository.update(id, patch);
}

export function deletePerson(id: string) {
  return personRepository.delete(id);
}
