import type { Person } from "@/core/entities/person.entity";
import { FAMILY_PROFILE } from "@/lib/ownership";

export function resolveLabel(profile: string, people: Person[]): string {
  if (profile === FAMILY_PROFILE) return "Família";
  return people.find((person) => person.id === profile)?.name ?? "Família";
}

/** True when `profile` points at a person id that no longer exists. */
export function isStaleProfile(profile: string, people: Person[]): boolean {
  return (
    profile !== FAMILY_PROFILE &&
    !people.some((person) => person.id === profile)
  );
}
