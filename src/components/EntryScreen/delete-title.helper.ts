// The dialog keeps its DOM while closing, so the title has to survive a modal
// state that no longer names an entry.
export function deleteTitle(modal: {
  type: string;
  entry?: { name: string };
}): string {
  if (modal.type !== "delete" || !modal.entry) {
    return "";
  }
  return `Excluir "${modal.entry.name}"?`;
}
