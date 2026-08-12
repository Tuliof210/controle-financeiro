// Generic OFX tag tokenizer: every tag the file contains becomes a node,
// aggregate or leaf, byte for byte — no schema knowledge, nothing dropped.
//
// An indexOf walk, not a lazy `([\s\S]*?)` regex: the same hazard `blocks()`
// in src/app/api/ofx/ofx-tags.helper.ts avoids, quadratic on a file full of
// unclosed tags. Every index below only moves forward, so this stays linear.
import { readHeader, skipWs } from "./header.helper.ts";
import {
  aggregate,
  leaf,
  type OfxNode,
  type OfxTagTree,
  resetIds,
} from "./tag-node.helper.ts";

// One tag, open to matched close. `next` is always > `at` in every branch
// below — that, not a depth limit, is what keeps thousands of unclosed
// siblings from looping.
// A tag that closes itself moves the cursor past its close; one that does not
// leaves it on the `<` the caller is already looking at.
function advance(at: number, closes: boolean, closeLength: number): number {
  if (closes) {
    return at + closeLength;
  }
  return at;
}

// A header with nothing after it has no root tag to parse.
function rootOf(text: string, next: number): OfxNode | null {
  if (next >= text.length) {
    return null;
  }
  return parseNode(text, next).node;
}

function parseNode(text: string, at: number) {
  const gt = text.indexOf(">", at + 1);
  if (gt === -1) {
    // Truncated mid tag-name: nothing after it can be parsed either way.
    return { node: leaf(text.slice(at + 1), ""), next: text.length };
  }
  const tag = text.slice(at + 1, gt);
  const afterOpen = gt + 1;
  const nextLt = text.indexOf("<", afterOpen);
  if (nextLt === -1) {
    return { node: leaf(tag, text.slice(afterOpen)), next: text.length };
  }

  const between = text.slice(afterOpen, nextLt);
  const closeTag = `</${tag}>`;
  // Blank text with the next tag OPENING something is the only aggregate
  // case; real text, an explicit close, or 1.x omitting this leaf's own
  // close in favor of an ancestor's, are all a leaf.
  if (between.trim() !== "" || text[nextLt + 1] === "/") {
    const ownClose = text.startsWith(closeTag, nextLt);
    return {
      node: leaf(tag, between),
      next: advance(nextLt, ownClose, closeTag.length),
    };
  }

  const children: OfxNode[] = [];
  let pos = nextLt;
  // Every `next` returned below can land right after a `</tag>`, on the
  // whitespace before the NEXT one — re-align before both the stop check and
  // the recursive call, or a pretty-printed sibling reads as a corrupt tag.
  pos = skipWs(text, pos);
  while (pos < text.length && text[pos + 1] !== "/") {
    const result = parseNode(text, pos);
    children.push(result.node);
    pos = skipWs(text, result.next);
  }
  const closesHere = text.startsWith(closeTag, pos);
  return {
    node: aggregate(tag, children),
    next: advance(pos, closesHere, closeTag.length),
  };
}

// Header entries from either dialect, then the tree rooted at whatever real
// tag follows — `<OFX>` in every file this app will see, but nothing below
// assumes that name.
function parseOfxTags(text: string): OfxTagTree {
  resetIds();
  const firstLt = text.indexOf("<");
  if (firstLt === -1) {
    return { header: [], root: null };
  }
  const { entries, next } = readHeader(text, firstLt);
  const header = entries.map(({ key, value }) => leaf(key, value));
  const root = rootOf(text, next);
  return { header, root };
}

export { parseOfxTags };
