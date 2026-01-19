"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TrainingEquipment, TrainingExperience, TrainingGoal } from "@/lib/training-profile/types";
import type { OnboardingWizardViewProps } from "./OnboardingWizard.types";

export function OnboardingWizardView(props: OnboardingWizardViewProps) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Onboarding</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quick preferences to recommend a starter plan (home-first if you want).
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          <RadioGroup
            value={props.experience}
            onValueChange={(v) => props.onExperienceChange(v as TrainingExperience)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="exp-newbie" value="newbie" />
              <Label htmlFor="exp-newbie">Newbie</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="exp-returning" value="returning" />
              <Label htmlFor="exp-returning">Returning</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="exp-intermediate" value="intermediate" />
              <Label htmlFor="exp-intermediate">Intermediate</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Goal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          <RadioGroup value={props.goal} onValueChange={(v) => props.onGoalChange(v as TrainingGoal)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="goal-general" value="general_fitness" />
              <Label htmlFor="goal-general">General fitness</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="goal-build" value="build_muscle" />
              <Label htmlFor="goal-build">Build muscle</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="goal-fat" value="fat_loss" />
              <Label htmlFor="goal-fat">Fat loss / cardio</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="goal-strength" value="strength" />
              <Label htmlFor="goal-strength">Strength</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Where will you train?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          <RadioGroup
            value={props.equipment}
            onValueChange={(v) => props.onEquipmentChange(v as TrainingEquipment)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="eq-bw" value="bodyweight" />
              <Label htmlFor="eq-bw">At home (bodyweight + cardio)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="eq-db" value="dumbbells_only" />
              <Label htmlFor="eq-db">At home (dumbbells)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="eq-full" value="full_gym" />
              <Label htmlFor="eq-full">Gym (full equipment)</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Days per week</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          <Select
            value={String(props.daysPerWeek)}
            onValueChange={(v) => props.onDaysPerWeekChange(Number(v) as 2 | 3 | 4 | 5 | 6)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select days/week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="6">6</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="h-10 flex-1" disabled={!props.hydrated} onClick={props.onContinue}>
          Continue
        </Button>
        <Button variant="outline" className="h-10 flex-1" onClick={props.onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}

