import type { Movement } from "@/core/entities/movement.entity";

// "familia" (the profile-provider sentinel) sees everyone; a person id sees
// only their own movements.
export function visibleFor(all: Movement[], profile: string): Movement[] {
  return profile === "familia"
    ? all
    : all.filter((movement) => movement.ownerId === profile);
}

export function splitByType(movements: Movement[]) {
  return {
    income: movements.filter((movement) => movement.type === "income"),
    expense: movements.filter((movement) => movement.type === "expense"),
  };
}
