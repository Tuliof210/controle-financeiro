import type { Person } from "@/core/entities/person.entity";
import type { EntryType } from "@/lib/entry-types";

// The ProfileProvider sentinel meaning "show every owner".
export const FAMILY_PROFILE = "familia";

// FAMILY_PROFILE sees everyone; a person id sees only their own entries.
export function visibleFor<T extends { ownerId: string }>(
  all: T[],
  profile: string,
): T[] {
  return profile === FAMILY_PROFILE
    ? all
    : all.filter((item) => item.ownerId === profile);
}

export function splitByType<T extends { type: EntryType }>(items: T[]) {
  return {
    income: items.filter((item) => item.type === "income"),
    expense: items.filter((item) => item.type === "expense"),
  };
}

// Default owner for a new entry: the active profile if it's a real person,
// else the first person (or "" when there are none).
export function resolveOwnerId(profile: string, people: Person[]): string {
  return people.some((person) => person.id === profile)
    ? profile
    : (people[0]?.id ?? "");
}
