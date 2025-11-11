"use client";

import * as React from "react";
import { api } from "@/trpc/react";
import type { IconPlatform } from "@/types/menu";

export type HeaderConfig = {
  title: string;
  subtitle?: string;
  iconName?: string;
  iconPlatform?: IconPlatform;
};

export function useHeaderState() {
  const utils = api.useUtils();
  const headerQuery = api.header.get.useQuery();
  const initialData: HeaderConfig | undefined =
    headerQuery?.data && typeof headerQuery.data === "object"
      ? (headerQuery.data as HeaderConfig)
      : undefined;

  const [header, setHeader] = React.useState<HeaderConfig | undefined>(initialData);

  React.useEffect(() => {
    setHeader(initialData);
  }, [initialData]);

  const updateMutation = api.header.update.useMutation({
    onSuccess: () => utils.header.get.invalidate(),
  });

  const updateHeader = React.useCallback(
    async (next: HeaderConfig) => {
      const snapshot = header;
      // optimistic
      setHeader(next);
      try {
        await updateMutation.mutateAsync({
          title: next.title,
          subtitle: next.subtitle,
          iconName: next.iconName,
          iconPlatform: next.iconPlatform,
        });
      } catch (err) {
        // rollback
        setHeader(snapshot);
      }
    },
    [header, updateMutation],
  );

  return {
    header,
    isLoading: headerQuery.isLoading,
    updateHeader,
  };
}