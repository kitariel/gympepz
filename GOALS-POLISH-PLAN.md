# Goals Polish Plan (Portal)

Goal: polish `/portal/goals/*` before adding new features by tightening UX, improving error handling, and clarifying separation of concerns.

## 1) Map the surface area
- [x] Inventory all `/portal/goals/*` routes and shared components.
- [x] Identify entry points, data sources, and UI state ownership.
- [x] Note any duplicated logic or inconsistent UX patterns.

Notes:
- Routes:
  - `/portal/goals` → Goals dashboard
  - `/portal/goals/new` → Create goal
  - `/portal/goals/[goalId]` → Goal detail + progress
- Entry points:
  - `src/app/portal/goals/page.tsx` → `GoalsDashboard` (container/view split).
  - `src/app/portal/goals/new/page.tsx` → inline page (form + mutations in-page).
  - `src/app/portal/goals/[goalId]/page.tsx` → inline page (data + dialogs + progress).
- Shared components (goals):
  - `GoalsDashboard`, `GoalCard`, `GoalProgress`, `GoalTemplatePicker`,
    `GoalTemplateConfirm`, `GoalTemplateCard`.
- Core data sources:
  - `useGoals` → `api.goal.getAll`.
  - `useGoal` → `api.goal.getById`, `api.goal.getProgress`.
  - `useGoalMutations` → `api.goal.create/update/delete/recordProgress`.
  - `GoalTemplateConfirm` → `api.exercise.list` lookup by template exercise name.
  - Local templates → `lib/goal-templates`.
  - Exercise selector → `ExerciseCombobox` in create page.
- UI state ownership:
  - Dashboard container owns picker/confirm/delete state.
  - Template picker container owns template selection + step state.
  - Template confirm container owns input + error state.
  - New goal page owns form state + submission errors.
  - Goal detail page owns dialog state + edit/record form state.
  - Card/progress containers transform goal/progress into view models.
- Duplication/UX notes:
  - Goal type configs are duplicated across create page and detail page.
  - Multiple hardcoded `/portal/goals` strings across components.
  - Loading/empty patterns differ between dashboard and detail pages.
- Known issues:
  - Starting a goal can show: `Exercise "Bench Press" not found. Create a custom goal instead.`
- Fixes:
  - Improved exercise matching in goal template confirm (normalized + partial match).
  - Added inline CTA to create a custom goal when template exercise lookup fails.

## 2) Error handling pass
- [x] Define a consistent error model for goals screens (network, auth, empty, server).
- [x] Add view-level error states with clear recovery actions.
- [x] Ensure errors are surfaced near the user action that triggered them.
- [x] Verify loading, empty, and error states are visually distinct.

Notes:
- Current error handling:
  - Create goal page shows inline error banner on validation/create failure.
  - Template confirm shows inline error banner (exercise missing / create failure).
  - Mutations use `toast` for update/delete/record errors.
- Implemented:
  - Added dashboard error card + retry via `refetch`.
  - Added goal detail error card with retry + back to goals.
  - Standardized destructive error card styling for goals screens.

## 3) Separation of concerns
- [x] Split containers from views where mixed.
- [x] Move data fetching and side effects into hooks/containers.
- [x] Keep presentational components pure and prop-driven.
- [x] Document each component's responsibilities in brief comments where needed.

Notes:
- Split `/portal/goals/new` into `GoalCreate` container/view.
- Split `/portal/goals/[goalId]` into `GoalDetail` container/view.

## 4) UX consistency pass
- [x] Align header, CTA, and action placements across goals screens.
- [x] Normalize spacing, card hierarchy, and button sizing.
- [x] Ensure navigation back to `/portal/goals` is clear and consistent.

Notes:
- Standardized back navigation to "Back to Goals" with icon on create/detail.
- Matched detail page padding to create page and aligned workout CTA wording.

## 5) Accessibility and resilience
- [x] Audit keyboard flow and focus states for key actions.
- [x] Check icon-only buttons for labels.
- [ ] Verify empty states and form errors are screen-reader friendly.

Notes:
- Added accessible label to icon-only delete button in goal detail.

## 6) Performance and load states
- [x] Identify heavy panels and split if needed.
- [x] Add meaningful suspense/fallbacks for slower data.
- [ ] Confirm no layout jumps on route transitions.

Notes:
- Avoided duplicate goal/progress fetches by passing goal data into `GoalProgress`.
- Added a progress skeleton for goal detail while progress data loads.

## 7) Testing & validation
- [ ] Add/extend tests for error states and critical transitions.
- [ ] Run through critical paths: create goal, view goal, edit progress.
- [ ] Validate behavior with slow network.

## 8) Final review checklist
- [x] No mixed concerns in a single file without a reason.
- [x] Every async path has loading + error handling.
- [x] No duplicate UI patterns across goals routes.
- [x] Performance improves or stays neutral.

Notes:
- Final review complete after polish passes on goals screens.

Summary:
- Added consistent error handling + retry across goals screens.
- Split goals create/detail into container/view pairs.
- Improved goals UX (navigation, dialogs, templates toggle, padding).
- Reduced duplicate fetching and added progress loading skeletons.
