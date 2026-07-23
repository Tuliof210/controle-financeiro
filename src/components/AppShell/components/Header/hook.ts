import { useEffect, useState } from "react";
import { useProfile } from "@/components/ProfileProvider/hook";
import { getGreeting } from "./greeting.helper";

type UseHeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export function useHeader({ sidebarOpen, onToggleSidebar }: UseHeaderProps) {
  const [greeting, setGreeting] = useState("");
  const { label } = useProfile();

  useEffect(() => {
    setGreeting(`${getGreeting(new Date())}, ${label}`);
  }, [label]);

  return { greeting, sidebarOpen, onToggleSidebar };
}
