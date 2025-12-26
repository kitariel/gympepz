# Codebase Examination Report

## Overview
This report summarizes the current state of the application, focusing on the recent "Active Workout" implementation and the underlying database schema.

### Project Structure
- **Stack**: T3 Stack (Next.js, tRPC, Prisma, Tailwind)
- **State**: Active development in `src/app/portal/log` (Workout Logging).
- **Database**: PostgreSQL with Prisma ORM.

## Key Findings

### 1. The "Mock Set" Architecture (Critical)
The most significant finding is a discrepancy between the **Database Schema** and the **Active Workout UI**.

- **Database Model**: The active code uses `WorkoutLogExercise`, which stores summary data:
  ```prisma
  model WorkoutLogExercise {
    sets   Int    // e.g., 3
    reps   Int    // e.g., 10
    weight Float? // e.g., 100
  }
  ```
  This model represents "3 sets of 10 reps at 100kg" as a *single row*.

- **User Interface**: The Active Workout page (`src/app/portal/log/workout/[id]/page.tsx`) presents a granular, set-by-set interface (Set 1, Set 2, Set 3).

- **The Workaround**: The frontend generates "Mock Sets" on the fly:
  ```typescript
  // src/app/portal/log/workout/[id]/page.tsx
  for (let i = 0; i < exerciseLog.sets; i++) {
     acc[exerciseId].sets.push({ id: `mock-${exerciseLog.id}-${i}`, ... });
  }
  ```

- **Consequences**:
  1.  **Data Loss**: Checking off "Set 1" is **not persisted** to the database. If the user refreshes, all checks are lost.
  2.  **Edit Limitations**: Changing the weight for "Set 1" updates the *entire exercise summary*, effectively changing the weight for all sets.
  3.  **Confusion**: Users might expect granular tracking (e.g., Set 1 @ 100kg, Set 2 @ 105kg), but the backend only supports one weight per exercise entry.

### 2. Schema Readiness
The `prisma/schema/workout_log.prisma` file *does* contain a `WorkoutSet` model intended for granular tracking:
```prisma
model WorkoutSet {
  setNumber    Int
  actualReps   Int
  actualWeight Float?
  completed    Boolean
  // ...
}
```
However, the `workoutSet` tRPC router is currently **disabled/commented out** in `src/server/api/root.ts`.

### 3. Recent Fixes
- **Start Workout Dialog**: Fixed an issue where starting a workout without selecting a day resulted in an "Untitled" empty workout.
- **Frontend Components**: `ProgressView` and `WorkoutLogList` are structurally sound and error-free.

## Recommendations

1.  **Migrate to `WorkoutSet`**: To support a true "Active Workout" experience where users can check off sets and log different weights per set, you **must** switch the backend to use the `WorkoutSet` model instead of `WorkoutLogExercise` (or use them in tandem).
2.  **Enable `workoutSet` Router**: Uncomment and implement the router in `src/server/api/root.ts`.
3.  **Refactor Active View**: Update `ActiveWorkoutPage` to fetch and mutate real `WorkoutSet` records instead of generating mocks.

## Summary
The application is functional for high-level logging, but the "Active Workout" feature is currently a stateless UI facade over a summary-based backend. Prioritize the migration to `WorkoutSet` for a production-quality experience.
