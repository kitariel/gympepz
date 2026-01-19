import { getJSON, remove, setJSON } from "./kv";
import { STORAGE_KEYS } from "./keys";
import type { UserTrainingProfile } from "@/lib/training-profile/types";

export const profileRepo = {
  get(): UserTrainingProfile | null {
    return getJSON<UserTrainingProfile>(STORAGE_KEYS.profile);
  },
  save(profile: UserTrainingProfile): void {
    setJSON(STORAGE_KEYS.profile, profile);
  },
  clear(): void {
    remove(STORAGE_KEYS.profile);
  },
};

