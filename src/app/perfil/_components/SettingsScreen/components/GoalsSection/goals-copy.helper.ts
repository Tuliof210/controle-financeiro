// The dialog keeps its DOM while closing, so the title has to survive a modal
// state that no longer names a goal.
const deleteTitle = (modal: {
  type: string;
  goal?: { name: string };
}): string => {
  if (modal.type !== "delete" || !modal.goal) {
    return "";
  }
  return `Excluir o objetivo "${modal.goal.name}"? Esta ação não pode ser desfeita.`;
};

export { deleteTitle };
