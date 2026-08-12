import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Person } from "@/core/entities/person.entity.ts";
import { apiGet } from "@/lib/api.ts";
import { FAMILY_PROFILE } from "@/lib/ownership.ts";
import { isStaleProfile, resolveLabel } from "./profile.helper.ts";

interface ProfileProviderProps {
  children: ReactNode;
}

interface ProfileContextValue {
  profile: string;
  setProfile: (next: string) => void;
  label: string;
  people: Person[];
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

function useProfileState(): ProfileContextValue {
  const [profile, setProfileRaw] = useState<string>(FAMILY_PROFILE);
  const [people, setPeople] = useState<Person[]>([]);
  const [peopleLoaded, setPeopleLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("profile");
      if (stored) {
        setProfileRaw(stored);
      }
    } catch {
      // Storage blocked: fall back to the default profile.
    }
  }, []);

  useEffect(() => {
    apiGet<Person[]>("/api/people").then((result) => {
      if (!result.error) {
        setPeople(result.data ?? []);
        setPeopleLoaded(true);
      }
    });
  }, []);

  const setProfile = useCallback((next: string) => {
    setProfileRaw(next);
    try {
      localStorage.setItem("profile", next);
    } catch {
      // Storage blocked: the switch still applies to this session.
    }
  }, []);

  // Self-heal: once people has actually loaded, a profile id that no
  // longer matches anyone (its person got deleted) resets to FAMILY_PROFILE
  // so `profile`/localStorage never stay stuck on a dangling id — only the
  // derived `label` used to fall back before this.
  useEffect(() => {
    if (peopleLoaded && isStaleProfile(profile, people)) {
      setProfile(FAMILY_PROFILE);
    }
  }, [peopleLoaded, profile, people, setProfile]);

  return {
    profile,
    setProfile,
    label: resolveLabel(profile, people),
    people,
  };
}

function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return ctx;
}

export type { ProfileProviderProps };
export { ProfileContext, useProfile, useProfileState };
