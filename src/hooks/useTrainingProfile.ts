"use client";

import { useCallback, useEffect, useState } from "react";

import { profileRepo } from "@/lib/storage/profileRepo";
import { nowIso, type UserTrainingProfile } from "@/lib/training-profile/types";

export function useTrainingProfile() {
  const [profile, setProfile] = useState<UserTrainingProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(profileRepo.get());
    setHydrated(true);
  }, []);

  const save = useCallback((partial: Omit<UserTrainingProfile, "createdAt" | "updatedAt">) => {
    const existing = profileRepo.get();
    const createdAt = existing?.createdAt ?? nowIso();
    const next: UserTrainingProfile = {
      ...partial,
      createdAt,
      updatedAt: nowIso(),
    };
    profileRepo.save(next);
    setProfile(next);
  }, []);

  const clear = useCallback(() => {
    profileRepo.clear();
    setProfile(null);
  }, []);

  return { profile, save, clear, hydrated };
}

