# MASTER TODO LIST (Consolidated)

## 1) Workout session switching (prevent 2 devices logging at once) — Top Priority
- Generate persistent `deviceId` per browser/device (store locally)
- Add DB model: `WorkoutSessionLock` (one per user)
  - `userId` (unique), `workoutLogId`, `deviceId`, `sessionId`, `startedAt`, `lastActiveAt`, `expiresAt`
- Implement server endpoints:
  - `acquireLock(userId, deviceId, sessionId)`
  - `takeoverLock(userId, deviceId, sessionId)`
  - `releaseLock(userId, deviceId)` on workout finish
- Trigger lock checks on-demand only:
  - Start workout
  - Resume workout
- Build takeover modal UX:
  - “Workout already active on another device”
  - “Cancel” / “Take over & start here”
- Add lock expiry logic (no heartbeat):
  - Use `expiresAt` OR treat `lastActiveAt` stale after X hours
  - Update `lastActiveAt` only on workout actions (complete set, rest skip, next exercise)

## 2) Device registry (so prompts show “Chrome on Mac”, not “someone else”)
- Add DB model: `UserDevice`
  - `userId`, `deviceId`, `platform`, `browser`, `createdAt`, `lastSeenAt`, optional `label`
- On login or when sync is enabled: upsert device record + update `lastSeenAt`
- Include device info in lock response for friendly prompt:
  - “Active on Chrome (Mac) • last active 2 min ago”
- (Later) Devices management page: rename/revoke devices

## 3) Sync refactor (offline-first, conflict-safe)
- Implement IndexedDB tables:
  - `workoutLogs`, `workoutSets`, `plans`, `goals`, `meta`, `outboxEvents`
- Create outbox event format:
  - `{id, entityType, entityId, action, payload, clientUpdatedAt, deviceId}`
- Sync loop:
  - Push outbox → server applies → returns authoritative updates → clear acked outbox
- Conflict policy:
  - Workouts: no conflicts (enforced by lock)
  - Plans/goals: Last-write-wins + (optional) “conflict inbox” later
- Add “last synced” status + clear “local only” state in UI

## 4) Offline templates & goals caching (online once → offline use)
- Use IndexedDB for template caching (not localStorage)
- Seed templates on first online visit:
  - `templates` + `days` + `items` + `exerciseLite` + `goalTemplates`
- Lazy cache template detail when opened (optional)
- Add `templatesVersion` in server + `meta` locally
- Refresh templates silently when online (version mismatch)
- Offline UI:
  - “Offline • Using saved templates”
  - Empty state: “Connect once to download templates”

## 5) Service worker (PWA reliability)
- Ensure SW caches app shell (routes, JS, CSS) for offline load
- Cache template/exercise GET requests as needed (stale-while-revalidate)
- Use SW only for caching + offline loading
- Do NOT rely on SW for cross-device sync (server DB does that)

## 6) Pricing + trial for sync ($3/month)
- Decide trial policy:
  - Recommended: 7-day trial starts only when user taps “Enable Sync”
- Trial UX:
  - “Sync trial · X days left”
  - 1 reminder near end
- No data loss after trial ends (sync pauses, local remains)
- Post-trial behavior:
  - “Continue sync for $3/month”
  - “Keep local only”
- Anti-abuse (light):
  - 1 trial per account (and/or per device)

## 7) Landing page alignment (MVP truth)
- Remove duplicated “How it works” section
- Fix/avoid overpromising cloud sync if not shipped everywhere yet
- Fix/remove Pricing link if 404
- Keep landing page fast (no YouTube embeds); mention videos as “inside the app”

## 8) Email sending (Next.js + OTP)
- Pick provider (Resend is fine for MVP)
- Verified sending domain: `mail.go-train.work`
- Set env:
  - `RESEND_FROM="GoTrain <no-reply@mail.go-train.work>"`
- Add SPF/DKIM/DMARC DNS records
- Add OTP email template + test deliverability

## 9) UI/flow polish we already flagged (training screens)
- Remove “Back to portal” during active workout/rest/summary flows
- Fix workout duration formatting (avoid crazy numbers like 934m)
- Hide “Volume” card if not computed
- Ensure rest timer clearly labeled + auto-advance stable
- Use bottom-sheet transitions (avoid full screen interruptions between exercises)

---

## ✅ Suggested implementation order (fastest path)
1. `deviceId` + `WorkoutSessionLock` + takeover modal
2. Outbox sync basics (workouts only)
3. Offline template caching (IndexedDB)
4. Service worker caching (app shell)
5. Payment + trial
6. Device registry polish
7. Landing + email deliverability cleanup
