"use client";

import { useCallback, useEffect, useState } from "react";

import { programRepo, type ActiveProgram } from "@/lib/storage/programRepo";
import { currentProgramRepo, type CurrentProgramRef } from "@/lib/storage/currentProgramRepo";
import { STORAGE_KEYS } from "@/lib/storage/keys";

function inferRefType(id: string): CurrentProgramRef["type"] {
  if (id.startsWith("custom_") || id.startsWith("custom")) return "custom";
  return "template";
}

export function useActiveProgram() {
  const [activeProgram, setActiveProgram] = useState<ActiveProgram | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [currentProgramRef, setCurrentProgramRef] = useState<CurrentProgramRef | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrateFromStorage = () => {
      const snap = currentProgramRepo.getSnapshot();
      if (snap) {
        setCurrentProgramRef(snap.ref);
        setActiveProgram({
          templateId: snap.ref.id,
          name: snap.programName,
          createdAt: snap.createdAt,
          updatedAt: snap.updatedAt,
          plan: snap.plan,
        });
        setSelectedTemplateId(snap.ref.id);
        return;
      }

      // legacy fallback
      const legacy = programRepo.getActiveProgram();
      setActiveProgram(legacy);
      setSelectedTemplateId(programRepo.getSelectedTemplateId());
      if (legacy) {
        setCurrentProgramRef({ type: inferRefType(legacy.templateId), id: legacy.templateId });
      } else {
        setCurrentProgramRef(null);
      }
    };

    hydrateFromStorage();
    setHydrated(true);

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === STORAGE_KEYS.currentProgramRef ||
        e.key === STORAGE_KEYS.currentProgramSnapshot ||
        e.key === STORAGE_KEYS.activeProgram ||
        e.key === STORAGE_KEYS.selectedTemplateId
      ) {
        hydrateFromStorage();
      }
    };

    const handleCustomStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string }>;
      const key = customEvent.detail?.key;
      if (
        key === STORAGE_KEYS.currentProgramRef ||
        key === STORAGE_KEYS.currentProgramSnapshot ||
        key === STORAGE_KEYS.activeProgram ||
        key === STORAGE_KEYS.selectedTemplateId
      ) {
        hydrateFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("workout-storage-changed", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("workout-storage-changed", handleCustomStorageChange);
    };
  }, []);

  const selectTemplate = useCallback((id: string) => {
    programRepo.setSelectedTemplateId(id);
    setSelectedTemplateId(id);
    setCurrentProgramRef({ type: inferRefType(id), id });
  }, []);

  const clearSelectedTemplate = useCallback(() => {
    programRepo.clearSelectedTemplateId();
    setSelectedTemplateId(null);
  }, []);

  const saveActiveProgram = useCallback((program: ActiveProgram) => {
    const ref: CurrentProgramRef = { type: inferRefType(program.templateId), id: program.templateId };
    currentProgramRepo.setCurrentProgram(ref, {
      programName: program.name,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
      plan: program.plan,
    });
    setActiveProgram(program);
    setCurrentProgramRef(ref);
  }, []);

  const clearActiveProgram = useCallback(() => {
    currentProgramRepo.clear();
    setActiveProgram(null);
    setCurrentProgramRef(null);
  }, []);

  return {
    hydrated,
    activeProgram,
    selectedTemplateId,
    selectTemplate,
    clearSelectedTemplate,
    saveActiveProgram,
    clearActiveProgram,
    currentProgramRef,
  };
}
