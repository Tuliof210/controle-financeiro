import { personRepository } from "@/infra/repositories/person.prisma.repository";

export function listPeople() {
  return personRepository.list();
}

export function createPerson(input: { name: string; color: string }) {
  return personRepository.create(input);
}

export function deletePerson(id: string) {
  return personRepository.delete(id);
}
