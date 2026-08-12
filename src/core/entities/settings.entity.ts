// No `id`: the row is a singleton pinned to 1 by the repository, so the
// identifier is a persistence detail no caller has any use for.
export interface Settings {
  monthlyGoalCents: number;
}
