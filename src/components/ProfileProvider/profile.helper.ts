import type { Person } from "@/core/entities/person.entity";

export function resolveLabel(profile: string, people: Person[]): string {
  if (profile === "familia") return "Família";
  return people.find((person) => person.id === profile)?.name ?? "Família";
}
