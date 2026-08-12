import type { ChangeEvent } from "react";
import { useProfile } from "@/components/ProfileProvider/hook.ts";

export function useProfileSelect() {
  const { profile, people, setProfile } = useProfile();

  return {
    profile,
    people,
    onChange: (event: ChangeEvent<HTMLSelectElement>) =>
      setProfile(event.target.value),
  };
}
