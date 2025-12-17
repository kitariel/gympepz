"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutLogList } from "./workout-log-list";
import { ProgressView } from "./progress-view";

export default function LogPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Logs & Progress</h2>
      </div>
      <Tabs defaultValue="workouts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workouts">Workout Logs</TabsTrigger>
          <TabsTrigger value="progress">Progress Charts</TabsTrigger>
        </TabsList>
        <TabsContent value="workouts" className="space-y-4">
          <WorkoutLogList />
        </TabsContent>
        <TabsContent value="progress" className="space-y-4">
          <ProgressView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
