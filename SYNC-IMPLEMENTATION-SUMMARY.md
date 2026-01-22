# Train Data Sync - Implementation Summary

**Status:** ✅ **COMPLETE**  
**Date:** 2025-01-22

---

## ✅ What Was Implemented

### **1. Backend Sync Endpoint**

**File:** `src/server/api/routers/workout-log.ts`

**Added:** `syncFromOffline` tRPC procedure

**Features:**
- ✅ Accepts both `workoutRepo` format (strings) and `OfflineWorkoutLog` format (numbers)
- ✅ Transforms string → number for reps/weight (workoutRepo)
- ✅ Converts ISO date strings → DateTime
- ✅ Creates `WorkoutLog` with calculated `duration` and `totalVolume`
- ✅ Groups sets by exercise → creates `WorkoutLogExercise` aggregates
- ✅ Creates `WorkoutSet` records for each set
- ✅ Handles conflicts (skips duplicate workouts by date)
- ✅ Validates sets (filters invalid entries)
- ✅ Returns sync results (synced count, failed count, errors)

**Data Transformation:**
- String → Number conversion with validation
- Date normalization (UTC start of day)
- RPE validation (1-10 range)
- Empty/invalid set filtering
- Volume calculation (sum of weight × reps)

---

### **2. Frontend Sync Hook**

**File:** `src/hooks/useSyncWorkouts.ts`

**Features:**
- ✅ Transforms `workoutRepo.getHistory()` → sync format
- ✅ Transforms `OfflineWorkoutLog` queue → sync format
- ✅ Combines both sources into single sync call
- ✅ Marks guest logs as synced after successful sync
- ✅ Invalidates workout queries after sync
- ✅ Returns sync status, unsynced count, errors

**Usage:**
```typescript
const { syncOfflineWorkouts, hasUnsyncedWorkouts, unsyncedCount, isSyncing } = useSyncWorkouts();
```

---

### **3. Auto-Sync Trigger**

**File:** `src/components/sync/SyncWorkoutsTrigger.tsx`

**Features:**
- ✅ Automatically syncs when user enters portal
- ✅ Runs once per session (prevents duplicate syncs)
- ✅ Shows toast notifications (success/failure)
- ✅ Resets on logout

**Integration:**
- Added to `src/app/portal/layout.tsx`
- Runs automatically when authenticated user enters portal

---

### **4. Manual Sync UI**

**File:** `src/app/portal/account/_parts/sync-card.tsx`

**Features:**
- ✅ Shows unsynced workout count
- ✅ Manual "Sync Now" button
- ✅ Sync status indicator
- ✅ Error display
- ✅ Toast notifications

**Integration:**
- Added to `src/app/portal/account/_parts/account-form.tsx`
- Visible in account settings page

---

## 📊 Sync Flow

```
┌─────────────────────┐
│  Offline /train     │
│  (LocalStorage)     │
│  - workoutRepo      │
│  - OfflineWorkoutLog│
└──────────┬──────────┘
           │
           │ User logs in / enters portal
           ▼
┌─────────────────────┐
│  SyncWorkoutsTrigger│
│  (Auto-sync)        │
└──────────┬──────────┘
           │
           │ useSyncWorkouts hook
           ▼
┌─────────────────────┐
│  Transform Data     │
│  - workoutRepo → DB │
│  - OfflineLog → DB  │
└──────────┬──────────┘
           │
           │ tRPC call
           ▼
┌─────────────────────┐
│  syncFromOffline    │
│  (Backend)          │
└──────────┬──────────┘
           │
           │ Create records
           ▼
┌─────────────────────┐
│  Database           │
│  - WorkoutLog        │
│  - WorkoutLogExercise│
│  - WorkoutSet       │
└─────────────────────┘
```

---

## 🔧 Technical Details

### **Data Format Support**

| Format | Source | Reps/Weight Type | Status |
|--------|--------|-------------------|--------|
| `workoutRepo` | `/train` (offline) | Strings | ✅ Supported |
| `OfflineWorkoutLog` | Guest mode | Numbers | ✅ Supported |

### **Transformation Logic**

1. **Type Conversion:**
   - String → Number with validation
   - Handles empty strings, null, undefined
   - Filters NaN and negative values

2. **Date Handling:**
   - ISO strings → DateTime
   - Normalizes to UTC start of day for `date`
   - Preserves time for `startTime` / `endTime`

3. **Aggregation:**
   - Groups sets by `exerciseId`
   - Calculates averages for `WorkoutLogExercise`
   - Preserves set order

4. **Calculations:**
   - `duration` = `(endTime - startTime) / 60000` (minutes)
   - `totalVolume` = Sum of `(actualWeight × actualReps)`

### **Conflict Handling**

- Checks for existing workout by `userId` + `date`
- Skips duplicate (doesn't create duplicate record)
- Reports as error in sync result
- User can manually resolve if needed

---

## 🎯 Usage Examples

### **Automatic Sync**
- User logs in → Enters portal → Syncs automatically
- No user action required
- Toast notification shows result

### **Manual Sync**
- User goes to Account page
- Sees "Sync Workouts" card
- Clicks "Sync Now" button
- Toast notification shows result

### **Programmatic Sync**
```typescript
import { useSyncWorkouts } from "@/hooks/useSyncWorkouts";

function MyComponent() {
  const { syncOfflineWorkouts, hasUnsyncedWorkouts } = useSyncWorkouts();
  
  const handleSync = async () => {
    const result = await syncOfflineWorkouts();
    console.log(`Synced ${result.synced} workouts`);
  };
  
  return (
    <button onClick={handleSync} disabled={!hasUnsyncedWorkouts}>
      Sync Workouts
    </button>
  );
}
```

---

## ✅ Testing Checklist

- [x] Sync endpoint accepts both formats
- [x] String → Number conversion works
- [x] Date conversion works
- [x] WorkoutLogExercise aggregation works
- [x] WorkoutSet creation works
- [x] Duration calculation works
- [x] Total volume calculation works
- [x] Conflict handling (duplicate dates)
- [x] Auto-sync on portal entry
- [x] Manual sync button works
- [x] Toast notifications display
- [x] Error handling works
- [x] Guest logs marked as synced

---

## 📝 Notes

### **workoutRepo Sync Behavior**
- Currently syncs **all completed workouts** (no synced flag)
- Backend prevents duplicates (checks by date)
- Safe to sync multiple times (won't create duplicates)
- Future enhancement: Add `synced` flag to workoutRepo

### **OfflineWorkoutLog Sync Behavior**
- Uses existing `synced` flag
- Only syncs unsynced logs
- Marks as synced after successful sync

### **Program Metadata**
- `templateId`, `programRef`, `programName` not stored in DB
- Can be inferred from `planDayId` → `PlanDay` → `Plan`
- Low impact (metadata is for display)

---

## 🚀 Next Steps (Optional)

1. **Add synced flag to workoutRepo** - Track which workouts are synced
2. **Background sync** - Periodically sync when online
3. **Sync progress indicator** - Show detailed progress for large syncs
4. **Conflict resolution UI** - Let user choose which workout to keep
5. **Schema enhancement** - Optionally add program metadata fields

---

**Implementation Complete!** ✅

The sync functionality is fully implemented and ready to use. Users can now sync their offline workouts to the cloud automatically or manually.
