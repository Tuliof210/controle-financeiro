import { useEffect, useState } from "react";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";
import { getGreeting } from "./greeting.helper.ts";
import { formatToday } from "./today.helper.ts";

interface UseHeaderProps {
  sidebarExpanded: boolean;
  onToggleSidebar: () => void;
}

function catColor(profile: string, people: Person[]): string | undefined {
  const person = people.find((item) => item.id === profile);
  if (person === undefined) {
    return;
  }
  return `var(--cat-${person.color})`;
}

export function useHeader({
  sidebarExpanded,
  onToggleSidebar,
}: UseHeaderProps) {
  // Both lines are clock-derived, so both stay empty on the server and land in
  // the same effect — a second effect would only add another hydration seam.
  const [lines, setLines] = useState({ greeting: "", today: "" });
  const { label, profile, people } = useProfile();

  useEffect(() => {
    const now = new Date();
    setLines({
      greeting: `${getGreeting(now)}, ${label}`,
      today: formatToday(now),
    });
  }, [label]);

  return {
    ...lines,
    sidebarExpanded,
    onToggleSidebar,
    avatarName: label,
    avatarColor: catColor(profile, people),
  };
}
