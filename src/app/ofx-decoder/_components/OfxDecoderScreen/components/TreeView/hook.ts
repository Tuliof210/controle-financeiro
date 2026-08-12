import type { OfxNode } from "@/app/ofx-decoder/_components/OfxDecoderScreen/tag-node.helper.ts";

export interface TreeViewProps {
  fileName: string;
  header: OfxNode[];
  root: OfxNode;
  onClose: () => void;
  onFile: (file: File) => void;
}

// Nothing to derive — a pass-through keeps the folder shape uniform, like
// PageHeader and SectionCard.
export function useTreeView(props: TreeViewProps) {
  return props;
}
