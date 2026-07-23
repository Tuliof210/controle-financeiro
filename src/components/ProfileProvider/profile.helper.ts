import type { Person } from "@/core/entities/person.entity";

export function resolveLabel(profile: string, people: Person[]): string {
  if (profile === "familia") return "Família";
  return people.find((person) => person.id === profile)?.name ?? "Família";
}

/** True when `profile` points at a person id that no longer exists. */
export function isStaleProfile(profile: string, people: Person[]): boolean {
  return (
    profile !== "familia" && !people.some((person) => person.id === profile)
  );
}
