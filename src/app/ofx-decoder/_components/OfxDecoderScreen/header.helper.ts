// Header entries from either OFX dialect: 1.x's "KEY:VALUE" lines before the
// first tag, or 2.x's "<?xml?>" / "<?OFX?>" instructions. Read here so
// tag-tree.helper.ts's parser never sees one and grows a tree node literally
// named "?xml".
export interface HeaderEntry {
  key: string;
  value: string;
}

// Real OFX is pretty-printed with a newline (sometimes indentation) between
// tags — every position handed to the tag parser has to land exactly on the
// next `<`, never on the whitespace before it.
export function skipWs(text: string, at: number): number {
  let i = at;
  while (i < text.length && /\s/.test(text[i])) {
    i++;
  }
  return i;
}

function splitEntry(text: string, at: number): HeaderEntry {
  return at === -1
    ? { key: text, value: "" }
    : { key: text.slice(0, at), value: text.slice(at + 1) };
}

// 1.x: "KEY:VALUE" lines in the prefix before the first tag. 2.x's prefix is
// empty (it opens straight on `<?xml`), so this yields no entries.
function sgmlEntries(prefix: string): HeaderEntry[] {
  return prefix
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => splitEntry(line, line.indexOf(":")));
}

// 2.x: "<?target rest?>" processing instructions. 1.x has none, so the loop
// never starts and `next` is `at`, skipped to the real root tag.
function xmlEntries(text: string, at: number) {
  const entries: HeaderEntry[] = [];
  let i = skipWs(text, at);
  while (text[i] === "<" && text[i + 1] === "?") {
    const end = text.indexOf(">", i + 2);
    if (end === -1) {
      return { entries, next: text.length };
    }
    const inner = text.slice(i + 2, text[end - 1] === "?" ? end - 1 : end);
    entries.push(splitEntry(inner, inner.search(/\s/)));
    i = skipWs(text, end + 1);
  }
  return { entries, next: i };
}

// Both dialects in one call: SGML lines before `firstTag`, then XML
// instructions from there. `next` is the index where the real tag tree
// begins — `<OFX>`, once the header (of either shape, or neither) is past.
export function readHeader(text: string, firstTag: number) {
  const sgml = sgmlEntries(text.slice(0, firstTag));
  const { entries: xml, next } = xmlEntries(text, firstTag);
  return { entries: [...sgml, ...xml], next };
}
