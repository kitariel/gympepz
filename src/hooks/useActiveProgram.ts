"use client";

import { useCallback, useEffect, useState } from "react";

import { programRepo, type ActiveProgram } from "@/lib/storage/programRepo";

export function useActiveProgram() {
  const [activeProgram, setActiveProgram] = useState<ActiveProgram | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setActiveProgram(programRepo.getActiveProgram());
    setSelectedTemplateId(programRepo.getSelectedTemplateId());
    setHydrated(true);
  }, []);

  const selectTemplate = useCallback((id: string) => {
    programRepo.setSelectedTemplateId(id);
    setSelectedTemplateId(id);
  }, []);

  const clearSelectedTemplate = useCallback(() => {
    programRepo.clearSelectedTemplateId();
    setSelectedTemplateId(null);
  }, []);

  const saveActiveProgram = useCallback((program: ActiveProgram) => {
    programRepo.saveActiveProgram(program);
    setActiveProgram(program);
  }, []);

  const clearActiveProgram = useCallback(() => {
    programRepo.clearActiveProgram();
    setActiveProgram(null);
  }, []);

  return {
    hydrated,
    activeProgram,
    selectedTemplateId,
    selectTemplate,
    clearSelectedTemplate,
    saveActiveProgram,
    clearActiveProgram,
  };
}

