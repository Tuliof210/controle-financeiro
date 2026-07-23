"use client";

import {
  ProfileContext,
  type ProfileProviderProps,
  useProfileState,
} from "./hook";

export function ProfileProvider({ children }: ProfileProviderProps) {
  return (
    <ProfileContext.Provider value={useProfileState()}>
      {children}
    </ProfileContext.Provider>
  );
}
