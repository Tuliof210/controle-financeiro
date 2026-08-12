import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { getInitials } from "./initials.helper.ts";

export function useAvatar() {
  const { label } = useProfile();
  return { initials: getInitials(label) };
}
