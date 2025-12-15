"use client";

import { useMemo, useState } from "react";
import { api } from "@/trpc/react";
import { UploadButton } from "@/components/uploadthing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

type AccountUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
};

export function ProfileHeader({
  initialUser,
  email,
}: {
  initialUser: AccountUser | null;
  email: string;
}) {
  const user = initialUser;

  const initials = useMemo(() => {
    const display: string = (user?.name ?? email ?? "").toString();
    if (!display) return "?";
    const parts = display.split(" ").filter(Boolean);
    if (parts.length === 1) return (parts[0] ?? "").slice(0, 2).toUpperCase();
    const first = (parts[0]?.[0] ?? "").toUpperCase();
    const second = (parts[1]?.[0] ?? "").toUpperCase();
    return `${first}${second}`;
  }, [user?.name, email]);

  const [image, setImage] = useState<string | undefined>(
    user?.image ?? undefined,
  );

  const utils = api.useUtils();
  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      void utils.user.getByEmail.invalidate({ email });
    },
  });

  const locationQuery = api.location.getByUserEmail.useQuery(
    { email },
    { enabled: !!email },
  );

  const planLabel = "Free Plan";

  return (
    <Card className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 rounded-xl">
            <AvatarImage
              src={image}
              alt={user?.name ?? email ?? "User avatar"}
            />
            <AvatarFallback className="rounded-xl text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-lg font-medium">{user?.name ?? "Member"}</div>
            <div className="text-muted-foreground text-sm">{email}</div>
            <div className="text-muted-foreground mt-1 text-xs">
              {locationQuery.data?.country && locationQuery.data?.region
                ? `${locationQuery.data.region}, ${locationQuery.data.country}`
                : (locationQuery.data?.country ?? "Location not set")}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 md:items-end">
          <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            {planLabel}
          </div>
          <UploadButton
            endpoint="avatarUploader"
            onClientUploadComplete={async (
              res: Array<{ serverData?: { url?: string }; url?: string }>,
            ) => {
              const first = Array.isArray(res) ? res[0] : undefined;
              const url = first?.serverData?.url ?? first?.url;
              if (!url || !email) return;
              await updateProfile.mutateAsync({ email, image: url });
              setImage(url);
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error", error);
              alert(`Upload error: ${error.message}`);
            }}
          />
        </div>
      </div>
    </Card>
  );
}
