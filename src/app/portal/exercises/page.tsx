"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExerciseCard } from "./_components/exercise-card";
import { ExerciseFilters } from "./_components/exercise-filters";
import { ExerciseDetailModal } from "./_components/exercise-detail-modal";
import { AddToPlanDialog } from "./_components/add-to-plan-dialog";
import { Dumbbell, Heart, Plus, TrendingUp, Library } from "lucide-react";
import type { Exercise } from "@/types/exercise";

export default function ExercisesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedTab, setSelectedTab] = useState("all");

  // Modal state
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddToPlanDialogOpen, setIsAddToPlanDialogOpen] = useState(false);

  // Favorites
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // API calls
  const exercisesQuery = api.exercise.list.useQuery({
    q: searchQuery,
    muscleGroup: selectedMuscle !== "All" ? selectedMuscle : undefined,
    equipment: selectedEquipment !== "All" ? selectedEquipment : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    take: 1000, // Increased to show all exercises
  });

  const exerciseCountQuery = api.exercise.count.useQuery({
    q: searchQuery,
    muscleGroup: selectedMuscle !== "All" ? selectedMuscle : undefined,
    equipment: selectedEquipment !== "All" ? selectedEquipment : undefined,
    difficulty: selectedDifficulty !== "All" ? selectedDifficulty : undefined,
  });

  const exercises = exercisesQuery.data ?? [];
  const totalCount = exerciseCountQuery.data ?? 0;

  // Filter exercises by tab
  const filteredExercises = useMemo(() => {
    if (selectedTab === "favorites") {
      return exercises.filter((ex) => favorites.has(ex.id));
    }
    return exercises;
  }, [exercises, selectedTab, favorites]);

  // Group exercises by muscle group for stats
  const exercisesByMuscle = useMemo(() => {
    const grouped: Record<string, number> = {};
    exercises.forEach((ex) => {
      grouped[ex.muscleGroup] = (grouped[ex.muscleGroup] ?? 0) + 1;
    });
    return grouped;
  }, [exercises]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedMuscle !== "All") count++;
    if (selectedEquipment !== "All") count++;
    if (selectedDifficulty !== "All") count++;
    if (searchQuery) count++;
    return count;
  }, [selectedMuscle, selectedEquipment, selectedDifficulty, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedMuscle("All");
    setSelectedEquipment("All");
    setSelectedDifficulty("All");
  };

  const handleToggleFavorite = (exerciseId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  };

  const handleViewDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-6 pt-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Exercise Library
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Browse and discover exercises for your workouts
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Exercise
        </Button>
      </div>

      {/* Compact Stats */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="text-xs font-medium">Total</CardTitle>
            <Dumbbell className="text-muted-foreground h-3.5 w-3.5" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">{totalCount}</div>
            <p className="text-muted-foreground mt-0.5 text-[10px]">
              {exercises.length < totalCount ? `showing ${exercises.length} of ${totalCount}` : 'exercises'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="text-xs font-medium">Favorites</CardTitle>
            <Heart className="text-muted-foreground h-3.5 w-3.5" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">{favorites.size}</div>
            <p className="text-muted-foreground mt-0.5 text-[10px]">saved</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="text-xs font-medium">Muscle Groups</CardTitle>
            <TrendingUp className="text-muted-foreground h-3.5 w-3.5" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">
              {Object.keys(exercisesByMuscle).length}
            </div>
            <p className="text-muted-foreground mt-0.5 text-[10px]">
              categories
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="text-xs font-medium">Top Group</CardTitle>
            <Library className="text-muted-foreground h-3.5 w-3.5" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="truncate text-xl font-bold">
              {Object.entries(exercisesByMuscle).sort(
                ([, a], [, b]) => b - a,
              )[0]?.[0] ?? "N/A"}
            </div>
            <p className="text-muted-foreground mt-0.5 text-[10px]">
              most common
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ExerciseFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedMuscle={selectedMuscle}
        onMuscleChange={setSelectedMuscle}
        selectedEquipment={selectedEquipment}
        onEquipmentChange={setSelectedEquipment}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList className="h-9">
          <TabsTrigger value="all" className="gap-1.5 text-xs sm:text-sm">
            <Dumbbell className="h-3.5 w-3.5" />
            All ({exercises.length})
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-1.5 text-xs sm:text-sm">
            <Heart className="h-3.5 w-3.5" />
            Favorites ({favorites.size})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-4">
          {filteredExercises.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  id={exercise.id}
                  name={exercise.name}
                  muscleGroup={exercise.muscleGroup}
                  equipment={exercise.equipment ?? undefined}
                  difficulty={exercise.difficulty ?? undefined}
                  category={exercise.category ?? undefined}
                  imageUrl={exercise.imageUrl ?? undefined}
                  isFavorite={favorites.has(exercise.id)}
                  onToggleFavorite={() => handleToggleFavorite(exercise.id)}
                  onViewDetails={() => handleViewDetails(exercise)}
                  onAddToPlan={() => {
                    setSelectedExercise(exercise);
                    setIsAddToPlanDialogOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Dumbbell className="text-muted-foreground mb-3 h-10 w-10 opacity-50" />
                <h3 className="mb-1 text-base font-semibold">
                  No exercises found
                </h3>
                <p className="text-muted-foreground mb-3 text-center text-xs">
                  Try adjusting your filters or search query
                </p>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-4 space-y-4">
          {filteredExercises.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  id={exercise.id}
                  name={exercise.name}
                  muscleGroup={exercise.muscleGroup}
                  equipment={exercise.equipment ?? undefined}
                  difficulty={exercise.difficulty ?? undefined}
                  category={exercise.category ?? undefined}
                  imageUrl={exercise.imageUrl ?? undefined}
                  isFavorite={true}
                  onToggleFavorite={() => handleToggleFavorite(exercise.id)}
                  onViewDetails={() => handleViewDetails(exercise)}
                  onAddToPlan={() => {
                    setSelectedExercise(exercise);
                    setIsAddToPlanDialogOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Heart className="text-muted-foreground mb-3 h-10 w-10 opacity-50" />
                <h3 className="mb-1 text-base font-semibold">
                  No favorites yet
                </h3>
                <p className="text-muted-foreground mb-3 text-center text-xs">
                  Start adding exercises to your favorites by clicking the heart
                  icon
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTab("all")}
                >
                  Browse Exercises
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <ExerciseDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        exercise={selectedExercise}
        isFavorite={
          selectedExercise ? favorites.has(selectedExercise.id) : false
        }
        onToggleFavorite={() =>
          selectedExercise && handleToggleFavorite(selectedExercise.id)
        }
        onAddToPlan={() => {
          setIsAddToPlanDialogOpen(true);
        }}
      />

      {/* Add to Plan Dialog */}
      {selectedExercise && (
        <AddToPlanDialog
          open={isAddToPlanDialogOpen}
          onOpenChange={setIsAddToPlanDialogOpen}
          exerciseId={selectedExercise.id}
          exerciseName={selectedExercise.name}
        />
      )}
    </div>
  );
}
