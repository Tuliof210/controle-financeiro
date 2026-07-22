import { useEffect, useState } from "react";
import { getGreeting } from "./greeting.helper";

type UseHeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export function useHeader({ sidebarOpen, onToggleSidebar }: UseHeaderProps) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getGreeting(new Date()));
  }, []);

  return { greeting, sidebarOpen, onToggleSidebar };
}
