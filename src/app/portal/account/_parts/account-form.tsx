"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { api } from "@/trpc/react";
import { UploadButton } from "@/components/uploadthing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type AccountUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
};

export default function AccountForm({
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

  const [name, setName] = useState<string>(user?.name ?? "");
  const [image, setImage] = useState<string | undefined>(
    user?.image ?? undefined,
  );

  const utils = api.useUtils();
  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      // Invalidate user data so any other components (e.g., NavUser) refetch
      void utils.user.getByEmail.invalidate({ email });
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-[160px_1fr]">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24 rounded-xl">
          <AvatarImage
            src={image}
            alt={(user?.name ?? email) || "User avatar"}
          />
          <AvatarFallback className="rounded-xl text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>

        <UploadButton
          endpoint="avatarUploader"
          onClientUploadComplete={async (
            res: Array<{ serverData?: { url?: string }; url?: string }>,
          ) => {
            const first = Array.isArray(res) ? res[0] : undefined;
            const url = first?.serverData?.url ?? first?.url;
            if (!url || !email) return;
            await updateProfile.mutateAsync({ email, image: url });
            // Optimistically update local avatar for immediate feedback
            setImage(url);
          }}
          onUploadError={(error: Error) => {
            console.error("Upload error", error);
            alert(`Upload error: ${error.message}`);
          }}
        />
      </div>

      <form
        className="grid gap-4"
        onSubmit={async (e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          if (!email) return;
          await updateProfile.mutateAsync({ email, name });
        }}
      >
        <div className="grid gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Display name
          </label>
          <Input
            id="name"
            placeholder="Your name"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setName(e.target.value);
            }}
          />
        </div>

        <div>
          <Button
            type="submit"
            disabled={updateProfile.isPending}
            aria-busy={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
