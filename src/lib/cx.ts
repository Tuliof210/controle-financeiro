// Joins the class names that apply and drops the ones that do not — the
// `.filter(Boolean).join(" ")` three components already wrote by hand, in one
// place. `false` and `undefined` are the natural output of `cond && styles.x`,
// which is why they are accepted rather than coerced by the caller.
export const cx = (...names: (string | false | null | undefined)[]): string =>
  names.filter(Boolean).join(" ");
