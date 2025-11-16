"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { UploadButton } from "@/components/uploadthing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Include UploadThing styles (can also be added globally in globals.css)
import "@uploadthing/react/styles.css";

export default function AccountForm() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  type AccountUser = {
    id: string;
    email: string;
    name?: string | null;
    imageUrl?: string | null;
  };

  const userQuery = api.user.getByEmail.useQuery(
    { email },
    { enabled: !!email },
  );
  const user = userQuery.data as AccountUser | null;

  const initials = useMemo(() => {
    const display: string = (user?.name ?? email ?? "").toString();
    if (!display) return "?";
    const parts = display.split(" ").filter(Boolean);
    if (parts.length === 1) return (parts[0] ?? "").slice(0, 2).toUpperCase();
    const first = (parts[0]?.[0] ?? "").toUpperCase();
    const second = (parts[1]?.[0] ?? "").toUpperCase();
    return `${first}${second}`;
  }, [user?.name, email]);

  const [name, setName] = useState<string>((user?.name ?? "") as string);

  useEffect(() => {
    setName((user?.name ?? "") as string);
  }, [user?.name]);

  const utils = api.useUtils();
  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      // refetch user after update
      void utils.user.getByEmail.invalidate({ email });
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-[160px_1fr]">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24 rounded-xl">
          <AvatarImage
            src={(user?.imageUrl ?? undefined) as string | undefined}
            alt={(user?.name ?? email) as string}
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
            await updateProfile.mutateAsync({ email, imageUrl: url });
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
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
          />
        </div>

        <div>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </div>
  );
}
