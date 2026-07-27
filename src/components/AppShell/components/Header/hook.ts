import { useEffect, useState } from "react";
import { useProfile } from "@/components/ProfileProvider/hook";
import { getGreeting } from "./greeting.helper";
import { formatToday } from "./today.helper";

type UseHeaderProps = {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export function useHeader({
  sidebarCollapsed,
  onToggleSidebar,
}: UseHeaderProps) {
  // Both lines are clock-derived, so both stay empty on the server and land in
  // the same effect — a second effect would only add another hydration seam.
  const [lines, setLines] = useState({ greeting: "", today: "" });
  const { label } = useProfile();

  useEffect(() => {
    const now = new Date();
    setLines({
      greeting: `${getGreeting(now)}, ${label}`,
      today: formatToday(now),
    });
  }, [label]);

  return {
    ...lines,
    sidebarExpanded: !sidebarCollapsed,
    onToggleSidebar,
  };
}
