# Guest Storage UX Plan

Goal: make guest/offline storage visible, syncable, and safely clearable across `portal/train/*` and `train/*`.

## 1) Storage Indicator
- Add a compact status chip in `PortalTrainShell` and the non-portal `Train` shell.
- States:
  - `Guest • Local` (no session, local storage in use)
  - `Offline • Local` (session present but offline mode)
  - `Synced` (session present + online mode)
- Show queue count when available (e.g., pending workouts).

## 2) Sync CTA
- If no session: show `Sync & back up` button that routes to `/login`.
- If session + offline: show `Sync now` action (calls existing sync flows).
- Keep CTA near the storage indicator and in guest banner (already exists).

## 3) Clear Local Storage
- Add a `Clear local data` action in guest/offline menus.
- Require confirmation dialog:
  - Title: “Clear local training data?”
  - Body: “This removes plans, drafts, and offline logs from this device.”
  - Actions: `Cancel` / `Clear data`
- On confirm:
  - Clear guest keys (weekly snapshot, guest session, builder draft, offline queue).
  - Clear train keys (programs, drafts, history, prefs, sync queues).
  - Trigger `workout-storage-changed` event to update UI.

## 4) Plan-First Requirement
- If no session and no local plan:
  - Gate `/portal/train/log` with a plan-required prompt.
  - CTA to `Create plan` or `Use sample plan`.
- If a local plan exists, allow logging as normal.

## 5) Testing
- Cypress: add tests for storage indicator states and clear confirmation.
- Validate clear removes guest banner counts and hides local history.

## Notes
- Reuse existing local storage repos in `src/lib/storage/*` and guest storage in `src/lib/guest/storage.ts`.

## Task Checklist
- [x] Add storage indicator to portal/train and train shells.
- [x] Add sync CTA behavior (guest/login + offline sync).
- [x] Add clear local data confirmation dialog and wiring.
- [x] Implement plan-first gating for guest/offline logging.
- [ ] Add Cypress tests for sync CTA and clear flow.
