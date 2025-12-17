"use client";

import { useMemo, useState } from "react";
import { api } from "@/trpc/react";
import { UploadButton } from "@/components/uploadthing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Sparkles } from "lucide-react";

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
    <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-600 to-teal-700">
      <CardContent className="p-4">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16 ring-2 ring-white/30">
              <AvatarImage
                src={image}
                alt={user?.name ?? email ?? "User avatar"}
              />
              <AvatarFallback className="bg-white/20 text-white text-base font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-lg font-semibold text-white">{user?.name ?? "Member"}</div>
              <div className="text-white/80 text-xs mt-0.5">{email}</div>
              {locationQuery.data?.country && (
                <div className="flex items-center gap-1 text-white/70 text-xs mt-1">
                  <MapPin className="h-3 w-3" />
                  {locationQuery.data?.region
                    ? `${locationQuery.data.region}, ${locationQuery.data.country}`
                    : locationQuery.data.country}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-2 md:items-end w-full md:w-auto">
            <Badge className="bg-white/20 text-white border-white/30 text-xs px-2.5 py-0.5">
              <Sparkles className="h-3 w-3 mr-1" />
              {planLabel}
            </Badge>
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
      </CardContent>
    </Card>
  );
}
