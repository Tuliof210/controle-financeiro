import type { OfxNode } from "@/app/ofx-decoder/_components/OfxDecoderScreen/tag-node.helper.ts";

export interface TagNodeProps {
  node: OfxNode;
}

// Nothing to derive — a pass-through keeps the folder shape uniform, like
// PageHeader and SectionCard.
export function useTagNode({ node }: TagNodeProps) {
  return node;
}
