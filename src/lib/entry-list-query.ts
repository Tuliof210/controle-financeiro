const ENTRY_SORT_KEYS = ["initialDate", "createdAt", "name"] as const;
type EntrySortKey = (typeof ENTRY_SORT_KEYS)[number];
type EntrySortDir = "asc" | "desc";

interface EntryListQuery {
  name: string;
  kind: "all" | string;
  sort: EntrySortKey;
  dir: EntrySortDir;
}

const DEFAULT_ENTRY_LIST_QUERY: EntryListQuery = {
  name: "",
  kind: "all",
  sort: "createdAt",
  dir: "asc",
};

interface EntryListAdapters<T> {
  getInitialDate: (item: T) => number;
  getCreatedAt: (item: T) => string | Date;
  getKind?: (item: T) => string;
}

const collator = new Intl.Collator("pt-BR", { sensitivity: "base" });

function matchesName(name: string, query: string): boolean {
  const needle = query.trim();
  if (needle === "") {
    return true;
  }
  let index = 0;
  while (index <= name.length - needle.length) {
    const slice = name.slice(index, index + needle.length);
    if (collator.compare(slice, needle) === 0) {
      return true;
    }
    index += 1;
  }
  return false;
}

function matchesKind<T>(
  row: T,
  kind: string,
  getKind?: (row: T) => string,
): boolean {
  if (kind === "all" || getKind === undefined) {
    return true;
  }
  return getKind(row) === kind;
}

function compareItems<T extends { name: string }>(
  left: T,
  right: T,
  query: EntryListQuery,
  adapters: EntryListAdapters<T>,
): number {
  if (query.sort === "name") {
    return collator.compare(left.name, right.name);
  }
  if (query.sort === "initialDate") {
    return adapters.getInitialDate(left) - adapters.getInitialDate(right);
  }
  return (
    new Date(adapters.getCreatedAt(left)).getTime() -
    new Date(adapters.getCreatedAt(right)).getTime()
  );
}

function applyEntryListQuery<T extends { name: string }>(
  items: T[],
  query: EntryListQuery,
  adapters: EntryListAdapters<T>,
): T[] {
  let sign = -1;
  if (query.dir === "asc") {
    sign = 1;
  }
  return items
    .filter(
      (row) =>
        matchesName(row.name, query.name) &&
        matchesKind(row, query.kind, adapters.getKind),
    )
    .toSorted(
      (left, right) => sign * compareItems(left, right, query, adapters),
    );
}

export type { EntryListAdapters, EntryListQuery, EntrySortDir, EntrySortKey };
export { applyEntryListQuery, DEFAULT_ENTRY_LIST_QUERY, ENTRY_SORT_KEYS };
