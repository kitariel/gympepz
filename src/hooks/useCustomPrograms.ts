"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  customProgramsRepo,
  type CustomProgramRecord,
} from "@/lib/storage/customProgramsRepo";

export function useCustomPrograms() {
  const [items, setItems] = useState<CustomProgramRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(customProgramsRepo.list());
    setHydrated(true);
  }, []);

  const refresh = useCallback(() => {
    setItems(customProgramsRepo.list());
  }, []);

  const upsert = useCallback((record: CustomProgramRecord) => {
    customProgramsRepo.upsert(record);
    setItems(customProgramsRepo.list());
  }, []);

  const remove = useCallback((id: string) => {
    customProgramsRepo.remove(id);
    setItems(customProgramsRepo.list());
  }, []);

  const get = useCallback((id: string) => customProgramsRepo.get(id), []);

  const count = useMemo(() => items.length, [items]);

  return { hydrated, items, count, refresh, upsert, remove, get };
}

