import type { Recurrence } from "@/core/entities/recurrence.entity";

// "familia" (the profile-provider sentinel) sees everyone; a person id sees
// only their own recurrences.
export function visibleFor(all: Recurrence[], profile: string): Recurrence[] {
  return profile === "familia"
    ? all
    : all.filter((recurrence) => recurrence.ownerId === profile);
}

export function splitByType(recurrences: Recurrence[]) {
  return {
    income: recurrences.filter((recurrence) => recurrence.type === "income"),
    expense: recurrences.filter((recurrence) => recurrence.type === "expense"),
  };
}
