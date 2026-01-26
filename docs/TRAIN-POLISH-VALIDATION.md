# Train Polish Validation Checklist (Manual)

Use this to validate `/portal/train/*` before feature work.

## Validation run log
Use a fresh copy of the checklist per run.

Run date:
Build/branch:
Tester:
Notes:

### Run status
- [ ] Critical paths complete
- [ ] Offline/online complete
- [ ] Plans & templates complete
- [ ] UX/accessibility complete
- [ ] Performance complete

## Critical paths
- [ ] Open `/portal/train` and verify entry card renders for: new user, profile ready, program, draft.
- [ ] Start workout from entry → `/portal/train/log` loads and resumes correctly.
- [ ] Finish workout → `/portal/train/summary` shows metrics and next action.
- [ ] Navigate to history and open a recent session.

## Offline/online
- [ ] Toggle offline mode and verify status text and badges update.
- [ ] Force online sync error (simulate offline) and confirm error banner + retry.
- [ ] Confirm offline history still loads on `/portal/train/history`.

## Plans & templates
- [ ] Create plan in `/portal/train/build`, save, verify in `/portal/train/plans`.
- [ ] Duplicate + delete a plan in `/portal/train/plans`.
- [ ] Open `/portal/train/templates` and `/portal/train/template/[id]`.

## UX/accessibility
- [ ] Keyboard navigation through main CTAs on entry screen.
- [ ] Icon-only buttons have accessible labels.
- [ ] Focus states are visible on primary actions.

## Performance
- [ ] Confirm lazy-loaded pages show loading fallback (activity/build/history/templates).
- [ ] No layout jump on route transitions.
