import type { ComponentType } from "react";
import type { Person } from "@/core/entities/person.entity.ts";
import type { Entry, EntryType } from "@/lib/entry-types.ts";
import type {
  EntryFormSlotProps,
  EntryScreenLabels,
  ModalState,
} from "../../types.ts";

export type ModalsProps<T extends Entry, V extends { type: EntryType }> = {
  labels: Pick<EntryScreenLabels, "addTitle" | "editTitle">;
  modal: ModalState<T>;
  close: () => void;
  error?: string;
  people: Person[];
  onAdd: (values: V) => void;
  onUpdate: (values: V) => void;
  Form: ComponentType<EntryFormSlotProps<V>>;
};

// No state or effects of its own: the two <Modal>/<Form> pairs need the raw
// discriminated `modal` in the JSX itself so TS can narrow `modal.kind` /
// `modal.entry`, so there is nothing left to precompute here.
export function useModals<T extends Entry, V extends { type: EntryType }>(
  props: ModalsProps<T, V>,
) {
  return props;
}
