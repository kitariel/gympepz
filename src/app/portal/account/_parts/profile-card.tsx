"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "lucide-react";

type AccountUser = {
  name?: string | null;
  fitnessGoal?: string | null;
  experienceLevel?: string | null;
  bio?: string | null;
};

export function ProfileCard({
  user,
  email,
}: {
  user: AccountUser | null;
  email: string;
}) {
  const [name, setName] = useState<string>(user?.name ?? "");
  const [fitnessGoal, setFitnessGoal] = useState<string>(user?.fitnessGoal ?? "");
  const [experienceLevel, setExperienceLevel] = useState<string>(user?.experienceLevel ?? "");
  const [bio, setBio] = useState<string>(user?.bio ?? "");
  
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
            await updateProfile.mutateAsync({
              email,
              name,
              fitnessGoal,
              experienceLevel: experienceLevel as "Beginner" | "Intermediate" | "Advanced" | undefined,
              bio,
            });
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
            <label htmlFor="fitness-goal" className="text-xs font-medium">
              Fitness goal
            </label>
            <Input
              id="fitness-goal"
              placeholder="e.g., Build muscle, Lose weight"
              value={fitnessGoal}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFitnessGoal(e.target.value)
              }
              className="h-9"
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="experience-level" className="text-xs font-medium">
              Experience level
            </label>
            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger id="experience-level" className="h-9">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <label htmlFor="bio" className="text-xs font-medium">
              Bio
            </label>
            <Textarea
              id="bio"
              placeholder="Tell us a bit about yourself and your fitness journey"
              value={bio}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setBio(e.target.value)
              }
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <p className="text-muted-foreground text-[10px]">
              {bio.length}/500 characters
            </p>
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
