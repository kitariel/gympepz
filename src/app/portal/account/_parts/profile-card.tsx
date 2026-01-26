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
import { toast } from "sonner";

type AccountUser = {
  name?: string | null;
  fitnessGoal?: string | null;
  experienceLevel?: string | null;
  bio?: string | null;
};

const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

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

  const trimmedName = name.trim();
  const trimmedGoal = fitnessGoal.trim();
  const trimmedBio = bio.trim();
  const nameTooLong = trimmedName.length > 100;
  const goalTooLong = trimmedGoal.length > 200;
  const bioTooLong = trimmedBio.length > 500;
  const hasInvalidLevel =
    experienceLevel.length > 0 &&
    !EXPERIENCE_LEVELS.includes(experienceLevel as ExperienceLevel);
  const hasValidationError =
    nameTooLong || goalTooLong || bioTooLong || hasInvalidLevel;
  const hasChanges =
    trimmedName !== (user?.name ?? "") ||
    trimmedGoal !== (user?.fitnessGoal ?? "") ||
    trimmedBio !== (user?.bio ?? "") ||
    experienceLevel !== (user?.experienceLevel ?? "");
  
  const utils = api.useUtils();
  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      void utils.user.getByEmail.invalidate({ email });
      toast.success("Profile updated");
    },
    onError: (error) => {
      toast.error(error?.message ?? "Failed to update profile");
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
            if (hasValidationError || !hasChanges) return;
            try {
              await updateProfile.mutateAsync({
                email,
                name: trimmedName || undefined,
                fitnessGoal: trimmedGoal || undefined,
                experienceLevel: (experienceLevel || undefined) as ExperienceLevel | undefined,
                bio: trimmedBio || undefined,
              });
            } catch {
              // handled by mutation onError
            }
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
              aria-invalid={nameTooLong}
              aria-describedby={nameTooLong ? "name-error" : undefined}
              className="h-9"
            />
            {nameTooLong ? (
              <p id="name-error" className="text-[10px] text-destructive">
                Name must be 100 characters or less.
              </p>
            ) : null}
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
              aria-invalid={goalTooLong}
              aria-describedby={goalTooLong ? "goal-error" : undefined}
              className="h-9"
            />
            {goalTooLong ? (
              <p id="goal-error" className="text-[10px] text-destructive">
                Goal must be 200 characters or less.
              </p>
            ) : null}
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
                {EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasInvalidLevel ? (
              <p className="text-[10px] text-destructive">
                Select a valid experience level.
              </p>
            ) : null}
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
            <p
              className={`text-[10px] ${
                bioTooLong ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {bio.length}/500 characters
            </p>
          </div>
          <div className="flex justify-end md:col-span-2">
            <Button
              type="submit"
              size="sm"
              disabled={updateProfile.isPending || hasValidationError || !hasChanges}
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
