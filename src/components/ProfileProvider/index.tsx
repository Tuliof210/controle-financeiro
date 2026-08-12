"use client";

import {
  ProfileContext,
  type ProfileProviderProps,
  useProfileState,
} from "./hook.ts";

export function ProfileProvider({ children }: ProfileProviderProps) {
  return (
    <ProfileContext.Provider value={useProfileState()}>
      {children}
    </ProfileContext.Provider>
  );
}
