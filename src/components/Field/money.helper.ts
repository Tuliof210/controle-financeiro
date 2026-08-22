export function caretToEnd(el: HTMLInputElement) {
  const end = el.value.length;
  el.setSelectionRange(end, end);
}

export function shouldPinCaret(el: HTMLInputElement): boolean {
  return (
    el.selectionStart === el.selectionEnd &&
    el.selectionStart !== el.value.length
  );
}
