"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

type AccountUser = {
  name?: string | null;
};

export function ProfileCard({
  user,
  email,
}: {
  user: AccountUser | null;
  email: string;
}) {
  const [name, setName] = useState<string>(user?.name ?? "");
  const utils = api.useUtils();
  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      void utils.user.getByEmail.invalidate({ email });
    },
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="h-4 w-4 text-teal-600" />
          Profile
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Basic information for personalization
        </p>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!email) return;
            await updateProfile.mutateAsync({ email, name });
          }}
        >
          <div className="grid gap-1.5">
            <label htmlFor="name" className="text-xs font-medium">
              Display name
            </label>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              className="h-9"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">Fitness goal</label>
            <Input placeholder="Not set" disabled className="h-9" />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">Experience level</label>
            <Input placeholder="Not set" disabled className="h-9" />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">Bio</label>
            <Input placeholder="Tell us a bit about you" disabled className="h-9" />
          </div>
          <div className="flex justify-end md:col-span-2">
            <Button
              type="submit"
              size="sm"
              disabled={updateProfile.isPending}
              aria-busy={updateProfile.isPending}
              className="h-9"
            >
              {updateProfile.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
