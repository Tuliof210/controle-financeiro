import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type NoticeProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
};

export function useNotice({ title, icon, children }: NoticeProps) {
  return { title, icon, children };
}
