import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { Person } from "@/core/entities/person.entity";
import { apiGet } from "@/lib/api";
import { resolveLabel } from "./profile.helper";

export type ProfileProviderProps = {
  children: ReactNode;
};

type ProfileContextValue = {
  profile: string;
  setProfile: (next: string) => void;
  label: string;
  people: Person[];
};

export const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfileState(): ProfileContextValue {
  const [profile, setProfileRaw] = useState<string>("familia");
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("profile");
      if (stored) setProfileRaw(stored);
    } catch {}
  }, []);

  useEffect(() => {
    apiGet<Person[]>("/api/people").then((result) => {
      if (!result.error) setPeople(result.data ?? []);
    });
  }, []);

  const setProfile = (next: string) => {
    setProfileRaw(next);
    try {
      localStorage.setItem("profile", next);
    } catch {}
  };

  return {
    profile,
    setProfile,
    label: resolveLabel(profile, people),
    people,
  };
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return ctx;
}
