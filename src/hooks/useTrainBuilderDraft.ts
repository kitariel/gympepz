"use client";

import { useCallback, useEffect, useState } from "react";

import {
  trainBuilderDraftRepo,
  type TrainBuilderDraft,
} from "@/lib/storage/trainBuilderDraftRepo";

export function useTrainBuilderDraft() {
  const [draft, setDraft] = useState<TrainBuilderDraft | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDraft(trainBuilderDraftRepo.get());
    setHydrated(true);
  }, []);

  const save = useCallback((next: TrainBuilderDraft) => {
    trainBuilderDraftRepo.save(next);
    setDraft(next);
  }, []);

  const clear = useCallback(() => {
    trainBuilderDraftRepo.clear();
    setDraft(null);
  }, []);

  return { hydrated, draft, save, clear } as const;
}

