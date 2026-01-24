# Train Polish Plan (Portal Train First)

Goal: polish `/portal/train/*` before adding new features by tightening UX, improving error handling, and clarifying separation of concerns.

## 1) Map the surface area
- [x] Inventory all `/portal/train/*` routes and shared components.
- [x] Identify entry points, data sources, and UI state ownership.
- [x] Note any duplicated logic or inconsistent UX patterns.

Notes:
- Routes:
  - `/portal/train` → `PortalTrainEntryScreen` (`src/features/train/components/PortalTrainEntryScreen/*`)
  - `/portal/train/log` → `WorkoutLogger` (`src/components/train/WorkoutLogger`)
  - `/portal/train/overview` → `ProgramOverview` (`src/components/train/ProgramOverview`)
  - `/portal/train/history` → `HistoryList` (`src/components/train/HistoryList`)
  - `/portal/train/activity` → `ActivityList` (`src/features/train/components/ActivityList`)
  - `/portal/train/templates` → `TemplateList` (`src/components/train/TemplateList`)
  - `/portal/train/template/[templateId]` → `TemplateDetails` (`src/components/train/TemplateDetails`)
  - `/portal/train/build` → `CustomProgramBuilder` (`src/components/train/CustomProgramBuilder`)
  - `/portal/train/plans` → inline page + hooks (`useCustomPrograms`, `useActiveProgram`, `useWorkoutDraft`)
  - `/portal/train/onboarding` → `OnboardingWizard` (`src/components/train/OnboardingWizard`)
  - `/portal/train/summary` → inline page + hooks (`useActiveProgram`, `useWorkoutDraft`)
- Layout:
  - `src/app/portal/train/layout.tsx` wraps all with `TrainModeProvider`.
- Core data sources (entry screen):
  - Offline: `useTrainingProfile`, `useActiveProgram`, `useWorkoutDraft`, `useTrainPrefs`, `useTrainMode`.
  - Online: `api.workoutLog.list`, `api.workoutLog.getActiveWorkout`, `api.workoutLog.getStreak`, `useSession`.
- Shared navigation utilities:
  - `trainPath` in `src/lib/routes.ts`, `useNavigationContext` in `src/hooks/useNavigationContext.ts`.
- Early duplication/UX notes:
  - Hardcoded `/portal/train/*` strings appear in multiple components and pages.
  - Multiple “Loading…” states are inconsistent across pages (plain text vs. suspense fallback vs. cards).
  - `/portal/train/plans` and `/portal/train/summary` mix data, actions, and view logic in-page.

## 2) Error handling pass
- [x] Define a consistent error model for train screens (network, auth, empty, server).
- [x] Add view-level error states with clear recovery actions.
- [x] Ensure errors are surfaced near the user action that triggered them.
- [x] Verify loading, empty, and error states are visually distinct.

Notes:
- Error model applied:
  - Network/sync errors → inline alert with retry.
  - Render errors → route error boundary with reset.
  - Empty states remain in-card or list patterns.
- Updates:
  - Added inline sync error banner + retry to train entry views (portal + non-portal).
  - Added route-level error boundary for `/portal/train/*`.

## 3) Separation of concerns
- [x] Split containers from views where mixed.
- [x] Move data fetching and side effects into hooks/containers.
- [x] Keep presentational components pure and prop-driven.
- [x] Document each component’s responsibilities in brief comments where needed.

Notes:
- `/portal/train/summary` moved to `PortalTrainSummary` container/view split.
- `/portal/train/plans` moved to `PortalTrainPlans` container/view split.
- View components are prop-driven; routing/data hooks live in containers.

## 4) Code splitting and performance
- [x] Identify heavy components and split by route or feature.
- [x] Lazy load non-critical panels (e.g., history/programs sections).
- [x] Verify suspense/fallback UX feels intentional.

Notes:
- Portal train routes now use dynamic imports with simple, consistent fallbacks.
- Heavy pages split: activity, build, history, log, onboarding, overview, templates, template details.

## 5) UX consistency pass
- [x] Align header, CTA, and action placements across `/portal/train/*`.
- [x] Normalize spacing, card hierarchy, and button sizing.
- [x] Ensure navigation back to `/train` is clear and consistent.

Notes:
- Added shared `PortalTrainShell` for consistent padding and spacing.
- Added “Single view” link on key portal train screens (summary + plans) for quick `/train` access.

## 6) Accessibility and resilience
- [x] Audit keyboard flow and focus states for key actions.
- [x] Check icon-only buttons for labels.
- [x] Verify offline/online state is readable and actionable.

Notes:
- Added live status announcements for train status badges/labels.
- Verified icon-only controls in train UI use labels (sr-only/aria-label).

## 7) Testing & validation
- [ ] Add/extend tests for error states and route transitions.
- [ ] Run through critical paths: start workout, resume draft, view history.
- [ ] Validate behavior in offline mode and with slow network.

Notes:
- No automated test runner is set up in this repo.
- Added manual validation checklist: `TRAIN-POLISH-VALIDATION.md`.

## 8) Final review checklist
- [x] No mixed concerns in a single file without a reason.
- [x] Every async path has loading + error handling.
- [x] No duplicate UI patterns across portal train routes.
- [x] Performance improves or stays neutral.

Notes:
- Mixed concerns were split for summary + plans screens.
- Async entry data has inline error handling and route error boundary.
- Shared portal layout shell normalizes spacing.
- Dynamic imports added for heavy pages.
