# GymPepz – Architecture alignment

**Purpose:** Map the current codebase to the architecture plan (workouts, goals, meals, community, coaching — see Untitled-3, Plan.md) and list gaps + next steps.

**How to use:** Sections 1–7 compare plan vs existing (routes, components, services, hooks, types, data, DB). Section 8 summarizes. Section 9 gives prioritized next steps. Use this when implementing new features or refactoring.

### Quick reference

| Area | Status | Main gaps |
|------|--------|-----------|
| **Train core** (log, history, plans, templates) | ✅ Strong | `/train/log/[workoutId]`, `/train/history/[workoutId]` |
| **Goals** | ❌ Missing | Routes, components, services, hooks, types, DB |
| **Meals** | ❌ Missing | Routes, components, services, hooks, types, DB |
| **Community** | ❌ Missing | Routes, components, services, hooks, types, DB |
| **Coaching** | ❌ Missing | Messages data, `CoachMessage`, service, hooks, types |

---

## 1. Route map: plan vs existing

### 1.1 Public routes

| Plan | Existing | Status |
|------|----------|--------|
| `/` | `/` | ✅ Landing |
| `/login` | `/login` | ✅ |
| `/signup` | — | ❌ **Missing** (registration via `/login` flow) |

### 1.2 Onboarding

| Plan | Existing | Status |
|------|----------|--------|
| `/onboarding` | — | ❌ |
| `/onboarding/goals` | — | ❌ |
| `/onboarding/experience` | — | ❌ |
| `/onboarding/complete` | — | ❌ |
| — | `/train/onboarding` | ⚠️ Onboarding exists under `/train` |

**Gap:** No dedicated `/onboarding` flow. Plan expects multi-step onboarding (basic info → goals → experience → complete). Current onboarding is under `/train/onboarding`.

### 1.3 Train (main app)

**Revised:** **`/train`** = offline mode (standalone, local storage). **`/portal/train`** = synced mode (inside portal, API, DB). Optional sync: offline → server when user logs in.

| Plan | Existing | Status |
|------|----------|--------|
| `/train` | `/train` | ✅ Hub (offline) |
| `/portal/train` | — | ❌ **Missing** (synced train inside portal) |
| `/train/overview` | `/train/overview` | ✅ |
| `/train/log` | `/train/log` | ✅ |
| `/train/log/[workoutId]` | — | ❌ **Missing** (resume specific workout) |
| `/train/summary/[workoutId]` | `/train/summary` (uses `?logId`) | ⚠️ **Partial** (query param vs dynamic route) |
| `/train/history` | `/train/history` | ✅ |
| `/train/history/[workoutId]` | — | ❌ **Missing** (workout detail) |

### 1.4 Goals *(revised: inside portal only)*

| Route | Purpose | Status |
|-------|---------|--------|
| `/portal/goals` | Goals dashboard | ❌ **Missing** |
| `/portal/goals/new` | Create goal | ❌ **Missing** |
| `/portal/goals/[goalId]` | Goal detail + progress | ❌ **Missing** |

**Gap:** No goals feature. **Goals = inside portal only.** Use **portal layout** (no separate Goals layout). Synced via API. Connect to **portal train** when needed (e.g. workout complete → `recordProgress`).

### 1.5 Plans / programs

| Plan | Existing | Status |
|------|----------|--------|
| `/train/plans` | `/train/plans` | ✅ |
| `/train/plans/templates` | `/train/templates` | ⚠️ **Different path** |
| `/train/plans/build` | `/train/build` | ⚠️ **Different path** |
| `/train/plans/[programId]` | `/train/template/[templateId]` | ⚠️ Template detail exists; no “program” detail route |

**Gap:** Structure is similar but paths differ. No `/train/plans/[programId]` for generic program detail.

### 1.6 Meals

| Plan | Existing | Status |
|------|----------|--------|
| `/train/meals` | — | ❌ **Missing** |
| `/train/meals/today` | — | ❌ **Missing** |
| `/train/meals/week` | — | ❌ **Missing** |
| `/train/meals/settings` | — | ❌ **Missing** |

**Gap:** No meal-plan or nutrition routes.

### 1.7 Community

| Plan | Existing | Status |
|------|----------|--------|
| `/train/community` | — | ❌ **Missing** |
| `/train/community/post/[postId]` | — | ❌ **Missing** |
| `/train/community/new` | — | ❌ **Missing** |
| `/train/community/beginners` | — | ❌ **Missing** |
| `/train/community/my-posts` | — | ❌ **Missing** |

**Gap:** No community feature.

### 1.8 Other

| Plan | Existing | Status |
|------|----------|--------|
| — | `/portal` | ✅ Dashboard (not in plan) |
| — | `/portal/ai-planner` | ✅ AI planner |
| — | `/portal/exercises` | ✅ Exercise library |
| — | `/portal/account` | ✅ Account |
| — | `/~offline` | ✅ PWA offline fallback |

---

## 2. Components: plan vs existing

### 2.1 Layouts

| Plan | Existing | Status |
|------|----------|--------|
| `TrainLayout` (TrainHeader + BottomNav) | `TrainHeader` + `TrainBottomNav` + `WorkoutSessionDock` | ✅ |
| `LandingLayout` (Header + Footer) | Landing chunks + `Footer` | ✅ (structure differs) |

### 2.2 Train components

| Plan | Existing | Status |
|------|----------|--------|
| `WorkoutCard` | — | ❌ **Missing** (plan: view + container + types) |
| `ExerciseLogger` | `WorkoutLogger` (container + view + types in `features/train`) | ✅ |
| `ProgressChart` | — | ❌ **Missing** |
| `GoalCard` | — | ❌ **Missing** |
| `GoalProgress` | — | ❌ **Missing** |
| `MealCard` | — | ❌ **Missing** |
| `NutritionSummary` | — | ❌ **Missing** |
| `DayMealPlan` | — | ❌ **Missing** |
| `PostCard` | — | ❌ **Missing** |
| `CommentList` | — | ❌ **Missing** |
| `CreatePost` | — | ❌ **Missing** |
| `UserAvatar` | — | ❌ **Missing** (or use `Avatar` in ui) |
| `CoachMessage` | — | ❌ **Missing** |
| `MotivationCard` | — | ❌ **Missing** |

**Existing train feature components (View/Container/Types):**

- `HistoryList`, `WorkoutLogger`, `ProgramOverview`, `TrainEntryScreen`
- `TemplateCard`, `TemplateList`, `TemplateDetails`
- `CustomProgramBuilder`, `OnboardingWizard`, `SwipeableSetRow`

**Gap:** Strong coverage for workout/plan/template flows. No goals, meals, community, or coaching UI.

### 2.3 Duplication / structure

- `components/train/` has both legacy (e.g. `ProgramOverview.*`, `WorkoutLogger.*`) and re-exports from `features/train` (e.g. `HistoryList`).
- Plan: consistent `ComponentName` + `ComponentName.container` + `ComponentName.types` (+ optional `ComponentName.view`). Current train features already follow this.

**Recommendation:** Treat `features/train` as source of truth for train UI; keep `components/train` as thin re-exports or migrate remaining pieces into `features/train`.

---

## 3. Services & API: plan vs existing

### 3.1 Plan services (conceptual)

| Plan service | Existing | Status |
|--------------|----------|--------|
| `workout.service` | tRPC `workoutLog`, `workoutSet`; `lib/storage/workoutRepo`; `server/services/workout-planner` | ✅ (split across tRPC + repos + AI) |
| `goal.service` | — | ❌ **Missing** |
| `meal.service` | — | ❌ **Missing** |
| `coaching.service` | — | ❌ **Missing** |
| `community.service` | — | ❌ **Missing** |

### 3.2 tRPC routers

**Existing:** `menu`, `header`, `auth`, `user`, `location`, `gallery`, `exercise`, `plan`, `workoutLog`, `progress`, `analytics`.

**Missing for plan:** `goal`, `meal`, `coaching`, `community` routers.

### 3.3 Server services

- `server/services/workout-planner`: AI program generation, exercise logic, etc. ✅
- No dedicated `goal`, `meal`, `coaching`, or `community` services.

---

## 4. Hooks: plan vs existing

| Plan | Existing | Status |
|------|----------|--------|
| `useWorkout` | `useWorkoutDraft`, `useWorkoutTimer` | ⚠️ **Partial** (different API) |
| `useGoals` | — | ❌ **Missing** |
| `useMealPlan` | — | ❌ **Missing** |
| `useCoaching` | — | ❌ **Missing** |
| `useCommunity` | — | ❌ **Missing** |

**Other hooks:** `useActiveProgram`, `useCustomPrograms`, `useTrainingProfile`, `useTrainPrefs`, `useDebouncedCallback`, `useSwipeGesture`, etc. ✅

**Gap:** No hooks for goals, meals, coaching, or community.

---

## 5. Types: plan vs existing

| Plan (`types/`) | Existing | Status |
|-----------------|----------|--------|
| `workout.types` | Prisma-based + `WorkoutLogger.types`, etc. | ⚠️ **Partial** |
| `goal.types` | — | ❌ **Missing** |
| `meal.types` | — | ❌ **Missing** |
| `user.types` | — | ❌ **Missing** (auth/user implied) |
| `coaching.types` | — | ❌ **Missing** |
| `community.types` | — | ❌ **Missing** |

**Existing:** `types/exercise.ts`, `types/menu.ts`, plus feature-specific types in `features/train` and `lib/training-profile`, `lib/guest`.

**Gap:** No shared `goal`, `meal`, `coaching`, or `community` types.

---

## 6. Data & coaching content: plan vs existing

| Plan | Existing | Status |
|------|----------|--------|
| `data/coaching/doms-messages.ts` | — | ❌ **Missing** |
| `data/coaching/sickness-messages.ts` | — | ❌ **Missing** |
| `data/coaching/motivation-messages.ts` | — | ❌ **Missing** |

**Gap:** No coaching copy or structured messages (DOMS, sickness, motivation) as in Untitled-1 / Untitled-2.

---

## 7. Database (Prisma): plan vs existing

**Existing models:**

- **Plans:** `Plan`, `PlanDay`, `PlanExercise` ✅
- **Workouts:** `WorkoutLog`, `WorkoutLogExercise`, `WorkoutSet`, `ExercisePR`, `WorkoutStreak` ✅
- **Progress:** `ProgressEntry` (body metrics) ✅
- **Auth/users:** NextAuth + User, Account, Session, etc. ✅
- **Exercise:** `Exercise` ✅
- **Other:** `UserImage`, `UserLocation`, analytics-related, etc.

**Missing for plan:**

- **Goals:** No `Goal` (or equivalent) model.
- **Meals / nutrition:** No `Meal`, `DayMealPlan`, `NutritionGoals`, etc.
- **Community:** No `Post`, `Comment`, `Reaction`, etc.
- **Coaching:** No `CoachingMessage`, `UserHealthStatus`, or “message seen” tracking.

---

## 8. Summary: what exists vs what’s missing

### ✅ In good shape

- App structure: `app/`, `api/`, layouts.
- Train core: `/train`, `/train/overview`, `/train/log`, `/train/history`, `/train/plans`, `/train/build`, `/train/templates`, `/train/onboarding`, `/train/summary`.
- Workout logging: `WorkoutLogger`, sets, history, links to plans.
- Plans/templates: Plans, template browse, custom builder, active program.
- Feature pattern: View/Container/Types in `features/train`.
- Storage/repos: `workoutRepo`, `programRepo`, `currentProgramRepo`, etc.
- tRPC: `plan`, `workoutLog`, `workoutSet`, `progress`, `exercise`, etc.
- Portal: dashboard, AI planner, exercises, account.
- PWA: offline page, install, etc.

### ❌ Missing (by plan)

1. **Goals** *(inside portal)*
   - Routes: `/portal/goals`, `/portal/goals/new`, `/portal/goals/[goalId]`; use **portal layout**.
   - Components: `GoalCard`, `GoalProgress`.
   - `goal.service`, `useGoals`, `goal.types`, `Goal` model, tRPC `goal` router.

2. **Meals**
   - Routes: `/train/meals`, `/train/meals/today`, `/train/meals/week`, `/train/meals/settings`.
   - Components: `MealCard`, `NutritionSummary`, `DayMealPlan`.
   - `meal.service`, `useMealPlan`, `meal.types`, meal/nutrition models, tRPC `meal` router.

3. **Community**
   - Routes: `/train/community`, `.../post/[postId]`, `.../new`, `.../beginners`, `.../my-posts`.
   - Components: `PostCard`, `CommentList`, `CreatePost`, etc.
   - `community.service`, `useCommunity`, `community.types`, Post/Comment (etc.) models, tRPC `community` router.

4. **Coaching**
   - No dedicated routes (messages can be in-app).
   - Components: `CoachMessage`, `MotivationCard`.
   - `coaching.service`, `useCoaching`, `coaching.types`.
   - `data/coaching/`: `doms-messages`, `sickness-messages`, `motivation-messages`.
   - Optional: `UserHealthStatus`, coaching metadata in DB.

5. **Onboarding**
   - Plan: `/onboarding` multi-step (basic info → goals → experience → complete).  
   - Current: `/train/onboarding` only. Gap = structure and placement.

6. **Misc**
   - `/signup` as a distinct route (if desired).
   - `WorkoutCard` (if we want a dedicated card for hub/overview).
   - `ProgressChart` for progress viz.
   - `/train/log/[workoutId]` and `/train/history/[workoutId]` for resume/detail.

---

## 9. Recommended next steps (priority order)

### Phase 1 – Foundation (align with plan)

1. **Goals** *(inside portal only)*
   - Add Prisma `Goal` (and related) models.
   - Add `types/goal.types.ts`, tRPC `goal` router, `useGoals`.
   - Implement **`/portal/goals`**, **`/portal/goals/new`**, **`/portal/goals/[goalId]`** under **`app/portal/goals/`** (use **portal layout**).
   - Add `GoalCard` and `GoalProgress` (View/Container/Types in `features/goals`).
   - Add Goals to portal nav (sidebar / `MobileBottomNav`) → `/portal/goals`.
   - **Portal train** (optional): add `/portal/train` for synced train; **sync** offline `/train` data when user logs in.

2. **Coaching content**
   - Create `data/coaching/doms-messages.ts`, `sickness-messages.ts`, `motivation-messages.ts` (or equivalent).
   - Add `types/coaching.types.ts` and `CoachingMessage` (and related) shape.

3. **Coaching UX**
   - Add `CoachMessage` (and optionally `MotivationCard`).
   - Add `coaching.service` + `useCoaching` that use the new types and message data.
   - Integrate DOMS/sickness/motivation flows into relevant train pages (e.g. post-workout, rest day).

### Phase 2 – Nutrition & community

4. **Meals**
   - Add meal/nutrition Prisma models.
   - Add `types/meal.types.ts`, tRPC `meal` router, `useMealPlan`.
   - Implement `/train/meals`, `/train/meals/today`, `/train/meals/week`, `/train/meals/settings`.
   - Add `MealCard`, `NutritionSummary`, `DayMealPlan`.

5. **Community**
   - Add Post, Comment (and optionally Reaction) models.
   - Add `types/community.types.ts`, tRPC `community` router, `useCommunity`.
   - Implement `/train/community` and sub-routes.
   - Add `PostCard`, `CommentList`, `CreatePost`, etc.

### Phase 3 – Polish & onboarding

6. **Routes**
   - Add `/train/log/[workoutId]` and `/train/history/[workoutId]` (or align summary with `[workoutId]`).
   - Consider `/onboarding` vs `/train/onboarding` and align with plan.

7. **Components**
   - Add `WorkoutCard` and `ProgressChart` if needed for hub/overview.

8. **Cleanup**
   - Resolve `components/train` vs `features/train` (prefer features as source of truth, thin re-exports in components).
   - Optionally align `/train/plans/*` paths with plan (e.g. `templates` → `plans/templates`) if you want 1:1 route match.

---

## 10. Doc references

- **User journey (Alex):** Untitled-2 (meals + goals + community + workouts).
- **Beginner coaching (DOMS, sickness):** Untitled-1.
- **Architecture (routes, components, services, hooks, types):** Untitled-3.
- **Summary:** Untitled-4.

Use this file as the single “existing vs plan” map when implementing goals, meals, community, and coaching.
