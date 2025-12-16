"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <Card className="bg-card text-card-foreground from-primary to-primary/80 rounded-xl border border-none shadow-sm">
      <CardHeader className="border-b py-4">
        <div>
          <div className="text-sm font-semibold">Profile</div>
          <div className="text-muted-foreground text-xs">
            Basic information for personalization
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-card-foreground rounded-b-xl pb-4">
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!email) return;
            await updateProfile.mutateAsync({ email, name });
          }}
        >
          <div className="grid gap-2">
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
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium">Fitness goal</label>
            <Input placeholder="Not set" disabled />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium">Experience level</label>
            <Input placeholder="Not set" disabled />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium">Bio</label>
            <Input placeholder="Tell us a bit about you" disabled />
          </div>
          <div className="flex justify-end md:col-span-2">
            <Button
              type="submit"
              disabled={updateProfile.isPending}
              aria-busy={updateProfile.isPending}
            >
              {updateProfile.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
