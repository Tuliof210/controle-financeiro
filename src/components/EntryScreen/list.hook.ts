import { useState } from "react";
import type { SelectOption } from "@/components/Select/hook.ts";
import {
  applyEntryListQuery,
  DEFAULT_ENTRY_LIST_QUERY,
  type EntryListAdapters,
} from "@/lib/entry-list-query.ts";
import type { Entry } from "@/lib/entry-types.ts";
import { splitByType, visibleFor } from "@/lib/ownership.ts";

type EntryListConfig<T> = EntryListAdapters<T> & {
  kinds?: SelectOption[];
};

function useEntryList<T extends Entry>(
  items: T[],
  profile: string,
  list: EntryListConfig<T>,
) {
  const [query, setQuery] = useState(DEFAULT_ENTRY_LIST_QUERY);
  const visible = applyEntryListQuery(visibleFor(items, profile), query, list);
  return {
    ...splitByType(visible),
    query,
    onQueryChange: setQuery,
  };
}

export type { EntryListConfig };
export { useEntryList };
