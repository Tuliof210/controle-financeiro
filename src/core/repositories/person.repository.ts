import type { Person } from "@/core/entities/person.entity.ts";

export interface PersonRepository {
  list(): Promise<Person[]>;
  create(input: { name: string; color: string }): Promise<Person>;
  update(id: string, patch: { name: string; color: string }): Promise<Person>;
  delete(id: string): Promise<void>;
}
