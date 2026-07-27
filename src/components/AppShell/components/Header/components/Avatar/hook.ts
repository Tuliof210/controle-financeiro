import { useProfile } from "@/components/ProfileProvider/hook";
import { getInitials } from "./initials.helper";

export function useAvatar() {
  const { label } = useProfile();
  return { initials: getInitials(label) };
}
