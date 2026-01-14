"use client";

import { useState, useMemo } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExerciseCard } from "./_components/exercise-card";
import { ExerciseFilters } from "./_components/exercise-filters";
import { ExerciseDetailModal } from "./_components/exercise-detail-modal";
import { AddToPlanDialog } from "./_components/add-to-plan-dialog";
import { Dumbbell } from "lucide-react";
import type { Exercise } from "@/types/exercise";

export default function ExercisesPage() {
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

  const exercises = exercisesQuery.data ?? [];

  // Filter exercises by tab
  const filteredExercises = useMemo(() => {
    if (selectedTab === "favorites") {
      return exercises.filter((ex) => favorites.has(ex.id));
    }
    return exercises;
  }, [exercises, selectedTab, favorites]);

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
    <div className="flex-1 space-y-6 p-6 pt-4">
      {/* Simple Header with Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {filteredExercises.length} exercises for you
          </h2>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          Most Popular
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </Button>
      </div>

      {/* Filters - Minimized */}
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

      {/* Exercise Grid */}
      {filteredExercises.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <h3 className="mb-1 text-base font-semibold">No exercises found</h3>
            <p className="text-muted-foreground mb-3 text-center text-xs">
              Try adjusting your filters or search query
            </p>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

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
