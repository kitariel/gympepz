"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import {
  customProgramsRepo,
  type CustomProgramRecord,
} from "@/lib/storage/customProgramsRepo";
import { currentProgramRepo } from "@/lib/storage/currentProgramRepo";
import { getJSON, setJSON } from "@/lib/storage/kv";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import type { ProgramTemplateDay } from "@/lib/program-templates/types";

type SyncProgramPayload = {
  id: string;
  name: string;
  source: "custom" | "template";
  createdAt: string;
  updatedAt: string;
  plan: { days: ProgramTemplateDay[] };
};

function toPayload(record: CustomProgramRecord): SyncProgramPayload {
  return {
    id: record.id,
    name: record.name,
    source: "custom",
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    plan: record.plan,
  };
}

function isCustomId(id: string): boolean {
  return id.startsWith("custom") || id.startsWith("custom_");
}

export function useSyncPrograms() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const { isOnline } = useOnlineStatus();
  const syncMutation = api.program.sync.useMutation();
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const syncingRef = useRef(false);

  const buildLocalPayload = useCallback(() => {
    const customPrograms = customProgramsRepo.list();
    const payload: SyncProgramPayload[] = customPrograms.map(toPayload);
    const currentSnapshot = currentProgramRepo.getSnapshot();

    if (currentSnapshot && !payload.some((p) => p.id === currentSnapshot.ref.id)) {
      payload.push({
        id: currentSnapshot.ref.id,
        name: currentSnapshot.programName,
        source: currentSnapshot.ref.type === "custom" || isCustomId(currentSnapshot.ref.id)
          ? "custom"
          : "template",
        createdAt: currentSnapshot.createdAt,
        updatedAt: currentSnapshot.updatedAt,
        plan: currentSnapshot.plan,
      });
    }

    return payload;
  }, []);

  const applyPull = useCallback((programs: SyncProgramPayload[]) => {
    const activeRef = currentProgramRepo.getRef();
    const pullById = new Map(programs.map((p) => [p.id, p]));

    for (const program of programs) {
      if (program.source === "custom") {
        customProgramsRepo.upsert({
          id: program.id,
          name: program.name,
          createdAt: program.createdAt,
          updatedAt: program.updatedAt,
          plan: program.plan,
        }, { markDirty: false });
      }
    }

    if (activeRef && pullById.has(activeRef.id)) {
      const active = pullById.get(activeRef.id)!;
      currentProgramRepo.setCurrentProgram(
        { type: active.source === "custom" ? "custom" : "template", id: active.id },
        {
          programName: active.name,
          createdAt: active.createdAt,
          updatedAt: active.updatedAt,
          plan: active.plan,
        },
        { markDirty: false },
      );
    }
    setJSON(STORAGE_KEYS.programsDirty, false);
  }, []);

  const syncPrograms = useCallback(async (options?: { force?: boolean }) => {
    if (!userId || !isOnline || syncingRef.current) {
      return { programs: [], activeProgramId: null };
    }
    syncingRef.current = true;

    try {
      const isDirty = Boolean(getJSON<boolean>(STORAGE_KEYS.programsDirty));
      if (!options?.force && !isDirty) {
        return { programs: [], activeProgramId: currentProgramRepo.getRef()?.id ?? null };
      }
      const payload = buildLocalPayload();
      const currentRef = currentProgramRepo.getRef();
      const result = await syncMutation.mutateAsync({
        userId,
        programs: payload,
        activeProgramId: currentRef?.id ?? null,
      });

      applyPull(result.programs);
      setJSON(STORAGE_KEYS.programsDirty, false);

      if (result.activeProgramId) {
        const pull = result.programs.find((p) => p.id === result.activeProgramId);
        const local = payload.find((p) => p.id === result.activeProgramId);
        const active = pull ?? local;

        if (active) {
          currentProgramRepo.setCurrentProgram(
            { type: active.source === "custom" ? "custom" : "template", id: active.id },
            {
              programName: active.name,
              createdAt: active.createdAt,
              updatedAt: active.updatedAt,
              plan: active.plan,
            },
            { markDirty: false },
          );
        }
      }
      setJSON(STORAGE_KEYS.programsDirty, false);

      setLastSyncedAt(new Date().toISOString());
      return result;
    } finally {
      syncingRef.current = false;
    }
  }, [userId, isOnline, syncMutation, buildLocalPayload, applyPull]);

  const isSyncing = useMemo(() => syncMutation.isPending, [syncMutation.isPending]);

  return {
    syncPrograms,
    isSyncing,
    lastSyncedAt,
  };
}
