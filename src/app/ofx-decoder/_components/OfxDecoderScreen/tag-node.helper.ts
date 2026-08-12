// The node shapes the tokenizer emits, and the counter that keys them for
// React. Split off tag-tree.helper.ts for the 100-line cap.

let nextId = 0;
const takeId = (): number => {
  const id = nextId;
  nextId += 1;
  return id;
};

// Reset per parse so a re-read of the same file yields the same keys.
const resetIds = (): void => {
  nextId = 0;
};

type OfxNode =
  | { id: number; tag: string; value: string }
  | { id: number; tag: string; children: OfxNode[] };

interface OfxTagTree {
  header: OfxNode[];
  root: OfxNode | null;
}

// Trimmed like src/app/api/ofx/ofx-tags.helper.ts's `leaf()`: the line break
// and indentation a pretty-printed file puts before the NEXT tag land inside
// `value` too (nothing about scanning for the next `<` can tell them apart
// from real content), and that formatting isn't the value the file encodes.
const leaf = (tag: string, value: string): OfxNode => ({
  id: takeId(),
  tag,
  value: value.trim(),
});
const aggregate = (tag: string, children: OfxNode[]): OfxNode => ({
  id: takeId(),
  tag,
  children,
});

export type { OfxNode, OfxTagTree };
export { aggregate, leaf, resetIds };
