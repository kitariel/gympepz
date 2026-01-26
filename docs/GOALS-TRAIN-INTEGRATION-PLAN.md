# Goals ↔ Train Log Integration Plan

**Purpose:** Auto-detect goal progress from workout logging (per set/exercise) while keeping manual goal creation intact.

---

## Current State (Observed)
- Goals are created independently (manual or template).
- Goal progress is updated when a workout is completed (`workout-log` router).
- Workout logger already computes `goalHint` per exercise.
- Goal templates include `exerciseId` / `exerciseName` for matching.

---

## Desired Behavior
1. User selects a goal (template or custom).
2. During training log:
   - Sets/rep/weight entries automatically update applicable goals.
   - Users see subtle feedback (e.g., "New PR toward Bench 225").
3. When workout is saved, goal progress is consistent with per-set tracking.

---

## Design Options

### Option A: Per-Set Progress (Recommended)
**When user logs a set:**
- For strength goal: use `max(weight)` across sets for that exercise.
- For reps goal: use `max(reps)` or `total reps` (decide per goal type).
- For consistency goal: increment on workout completion (current behavior).
- For bodyweight goal: manual only (no training log link).

**Pros:** Immediate feedback, accurate for strength/reps.
**Cons:** Requires extra mutation calls during logging.

### Option B: Workout Completion Only (Current)
**When workout completes:**
- Compute per-exercise best and update goals in one shot.

**Pros:** Fewer mutations.
**Cons:** No real-time progress feedback.

---

## Proposed Data Contract

### Goal Matching
Match by `goal.exerciseId` === `workoutLogExercise.exerciseId`.

### Progress Rule
```
strength: progressValue = max(set.weight) for that exercise
reps: progressValue = max(set.reps) for that exercise
consistency: +1 on workout completion
bodyweight: manual only
```

### Goal Update Rule
Update only if `progressValue > goal.currentValue`.

---

## Implementation Plan

### Phase 1 — Server: Add Per-Exercise Progress Mutation
- [x] Add `goal.recordProgressForExercise`:
  - Input: `{ exerciseId, weight?, reps? }`.
  - Resolve goals by `exerciseId`.
  - Update `goal.currentValue` and insert `goalProgress` rows.
  - Guard: only update if new value > current.
- [ ] Add tests for progress rules (strength/reps/consistency).

### Phase 2 — Client: Hook Into Workout Logger
- [x] In `WorkoutLogger.container.tsx`:
  - Track per-set completion and call progress mutation.
  - Surface a toast + inline hint for goal progress.
  - Add a "Track goals during workout" toggle.

### Phase 3 — UX Feedback
- [x] Show "Goal updated" in the exercise header.
- [x] Add toggle: "Track goals during workout".

---

## Open Questions
- Reps goal: Use `max reps` (locked in).
- Strength goal: Use top set or estimated 1RM?
- How to handle multiple goals for same exercise (update all)?

---

## Next Steps Checklist
- [ ] Confirm progress rule per goal type.
- [ ] Decide on realtime vs. completion update.
- [ ] Add server mutation and tests.
- [ ] Wire client logger updates + UX feedback.
