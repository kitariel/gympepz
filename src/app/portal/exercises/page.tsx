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
import { Dumbbell, Heart, Plus, TrendingUp, Library } from "lucide-react";

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
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Favorites
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // API calls
  const exercisesQuery = api.exercise.list.useQuery({
    q: searchQuery,
    muscleGroup:
      selectedMuscle !== "All" ? selectedMuscle : undefined,
    equipment:
      selectedEquipment !== "All" ? selectedEquipment : undefined,
    difficulty:
      selectedDifficulty !== "All" ? selectedDifficulty : undefined,
    take: 100,
  });

  const exercises = exercisesQuery.data ?? [];

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
      grouped[ex.muscleGroup] = (grouped[ex.muscleGroup] || 0) + 1;
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

  const handleViewDetails = (exercise: any) => {
    setSelectedExercise(exercise);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Exercise Library</h2>
          <p className="text-muted-foreground">
            Browse and discover exercises for your workouts
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Exercise
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exercises</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exercises.length}</div>
            <p className="text-xs text-muted-foreground">
              in your library
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favorites.size}</div>
            <p className="text-xs text-muted-foreground">
              saved exercises
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Muscle Groups</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(exercisesByMuscle).length}
            </div>
            <p className="text-xs text-muted-foreground">
              categories covered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Common</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(exercisesByMuscle).sort(
                ([, a], [, b]) => b - a
              )[0]?.[0] || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              muscle group
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
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            <Dumbbell className="h-4 w-4 mr-2" />
            All Exercises
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="h-4 w-4 mr-2" />
            Favorites ({favorites.size})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredExercises.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    // TODO: Implement add to plan
                    console.log("Add to plan:", exercise.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No exercises found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                {activeFiltersCount > 0 && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          {filteredExercises.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                    console.log("Add to plan:", exercise.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start adding exercises to your favorites by clicking the heart icon
                </p>
                <Button variant="outline" onClick={() => setSelectedTab("all")}>
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
        isFavorite={selectedExercise ? favorites.has(selectedExercise.id) : false}
        onToggleFavorite={() =>
          selectedExercise && handleToggleFavorite(selectedExercise.id)
        }
        onAddToPlan={() => {
          // TODO: Implement add to plan
          console.log("Add to plan:", selectedExercise?.id);
        }}
      />
    </div>
  );
}
