# Template Exercise Linking Plan

Goal: link hardcoded template exercises (`nameFallback`) to the exercise library (`exerciseId`) so goals and sets can match reliably.

## Phase 1: Mapping + matching rules
- [x] Define normalization rules (case, punctuation, synonyms).
- [x] Add a resolver that matches `nameFallback` → `exercise.id`.
- [x] Track unmatched exercises for review.

## Phase 2: One-time migration
- [x] Build a script to map all template items to `exerciseId`.
- [x] Store results in a DB table (templates + items).
- [x] Log failures with the original template + exercise name.

## Phase 3: Runtime fallback
- [x] Resolve missing `exerciseId` at template selection time.
- [x] Persist resolved IDs into the active program snapshot.
- [x] Keep `nameFallback` if no match is found.

## Phase 4: Integration with goals + logging
- [x] Use `exerciseId` when building workout sets (when available).
- [x] Match goals to sets by `exerciseId`.
- [x] Add a UI hint when a goal is linked to today’s exercise.

## Phase 5: Validation
- [ ] Run a mapping report (% matched, % missing).
- [ ] Spot-check popular exercises (e.g., Bench Press, Squat).
- [ ] Verify goal progress updates on linked sets.
