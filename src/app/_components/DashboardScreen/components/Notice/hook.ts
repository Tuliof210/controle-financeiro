import type { ReactNode } from "react";
import type { MvIconName } from "@/components/Icon/hook.ts";

export interface NoticeProps {
  title: string;
  icon: MvIconName;
  children: ReactNode;
}

export function useNotice({ title, icon, children }: NoticeProps) {
  return { title, icon, children };
}
