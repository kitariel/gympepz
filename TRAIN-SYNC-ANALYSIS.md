# Train Data Sync Analysis & Alignment Plan

**Purpose:** Analyze offline train data structure vs database schema, identify gaps, and plan sync implementation  
**Date:** 2025-01-22  
**Status:** ✅ Implementation Complete

---

## 📋 Overview

This document analyzes the alignment between:
1. **Offline train data** (local storage in `/train` - offline mode)
2. **Database schema** (for `/portal/train` - synced mode)
3. **Sync requirements** (offline → server when user logs in)

---

## 🔍 Data Structure Comparison

### **1. Offline Workout Structure**

#### **A. `workoutRepo.ts` (ActiveWorkoutDraft / WorkoutHistoryItem)**
```typescript
{
  id: string;                    // Local UUID
  templateId?: string;           // Template ID (if from template)
  programRef?: {                 // Program reference
    type: "template" | "custom";
    id: string;
  };
  programDayIndex?: 1-7;         // Day in program
  programDayLabel?: string;      // "Monday", etc.
  programName: string;           // Program name
  date: string;                  // ISO (workout day)
  startedAt: string;             // ISO
  completed: boolean;
  endedAt?: string;               // ISO (for history)
  exercises: Array<{
    id: string;
    name: string;
    order: number;
    targetSets: number | null;
    targetReps: string | null;   // ⚠️ STRING
    targetWeight: string | null; // ⚠️ STRING
  }>;
  sets: Array<{
    id: string;
    exerciseId: string;
    exerciseName: string;         // ⚠️ Denormalized
    setNumber: number;
    targetReps: string | null;   // ⚠️ STRING
    actualReps: string;          // ⚠️ STRING
    targetWeight: string | null; // ⚠️ STRING
    actualWeight: string | null; // ⚠️ STRING
    completed: boolean;
    createdAt: string;           // ISO
  }>;
  notes: string | null;
  restTimer: RestTimerState;     // ⚠️ Workout-level timer
  updatedAt: string;             // ISO
}
```

#### **B. `guest/types.ts` (OfflineWorkoutLog)**
```typescript
{
  clientLogId: string;            // UUID
  planDayId: string | null;
  date: string;                   // ISO
  startTime: string;              // ISO
  endTime: string | null;         // ISO
  completed: boolean;
  notes: string | null;
  synced: boolean;                 // ⚠️ Sync flag
  sets: Array<{
    clientSetId: string;          // UUID
    exerciseId: string;
    setNumber: number;
    targetReps: number | null;    // ✅ NUMBER
    actualReps: number;           // ✅ NUMBER
    targetWeight: number | null;  // ✅ NUMBER
    actualWeight: number | null;  // ✅ NUMBER
    rpe: number | null;
    completed: boolean;
    createdAt: string;            // ISO
  }>;
}
```

---

### **2. Database Schema (Prisma)**

#### **A. `WorkoutLog`**
```prisma
model WorkoutLog {
  id          String    @id @default(cuid())
  userId      String
  planDayId   String?   // ✅ Matches offline
  date        DateTime  // ✅ Matches offline
  startTime   DateTime  // ✅ Matches offline
  endTime     DateTime? // ✅ Matches offline
  duration    Int?      // ⚠️ Not in offline (can calculate)
  notes       String?   // ✅ Matches offline
  completed   Boolean   // ✅ Matches offline
  totalVolume Float?    // ⚠️ Not in offline (can calculate)
  createdAt   DateTime
  updatedAt   DateTime
  
  exercises WorkoutLogExercise[] // ⚠️ Aggregate structure
  sets      WorkoutSet[]          // ✅ Granular sets
}
```

#### **B. `WorkoutLogExercise` (Aggregate)**
```prisma
model WorkoutLogExercise {
  id            String
  workoutLogId String
  exerciseId    String
  sets          Int      // Total sets for this exercise
  reps          Int      // Target/avg reps
  weight        Float?   // Target/avg weight
  rpe           Int?
  notes         String?
  order         Int      // ✅ Matches offline exercises.order
}
```

#### **C. `WorkoutSet` (Granular)**
```prisma
model WorkoutSet {
  id           String
  workoutLogId String
  exerciseId   String
  setNumber    Int      // ✅ Matches offline
  targetReps   Int?     // ✅ Matches offline (guest/types)
  actualReps   Int      // ✅ Matches offline (guest/types)
  targetWeight Float?   // ✅ Matches offline (guest/types)
  actualWeight Float?   // ✅ Matches offline (guest/types)
  rpe          Int?     // ✅ Matches offline
  completed    Boolean  // ✅ Matches offline
  restSeconds  Int?     // ⚠️ Per-set, not workout-level
  notes        String?
  createdAt    DateTime
}
```

---

## ⚠️ Alignment Issues & Gaps

### **Critical Mismatches**

| Issue | Offline | Database | Impact | Solution |
|-------|---------|----------|--------|----------|
| **1. Program metadata** | `templateId`, `programRef`, `programName`, `programDayIndex`, `programDayLabel` | ❌ Not stored | Medium | Store in `notes` JSON or add optional fields |
| **2. Exercise names** | `exerciseName` in sets | ❌ Uses relation | Low | Lookup via `exerciseId` relation |
| **3. Data types** | Strings for reps/weight (workoutRepo) | Numbers | High | Convert during sync |
| **4. Rest timer** | Workout-level `restTimer` | Per-set `restSeconds` | Medium | Map to last set or ignore |
| **5. Aggregate exercises** | Flat `exercises` array | `WorkoutLogExercise` model | Medium | Derive from sets during sync |
| **6. Duration/Volume** | ❌ Not tracked | `duration`, `totalVolume` | Low | Calculate during sync |
| **7. Sync flag** | `synced: boolean` | ❌ Not needed | Low | Remove after sync |

### **Missing in Database**

- ❌ `templateId` / `programRef` / `programName` / `programDayIndex` / `programDayLabel`
- ❌ Workout-level rest timer (only per-set `restSeconds`)

### **Missing in Offline**

- ❌ `duration` (can calculate from `startTime` / `endTime`)
- ❌ `totalVolume` (can calculate from sets)
- ❌ `WorkoutLogExercise` aggregate (can derive from sets)

---

## ✅ Syncable Fields Mapping

### **Direct Mappings (1:1)**

| Offline Field | Database Field | Notes |
|---------------|----------------|-------|
| `planDayId` | `WorkoutLog.planDayId` | ✅ Direct |
| `date` | `WorkoutLog.date` | Convert ISO string → DateTime |
| `startTime` | `WorkoutLog.startTime` | Convert ISO string → DateTime |
| `endTime` | `WorkoutLog.endTime` | Convert ISO string → DateTime |
| `completed` | `WorkoutLog.completed` | ✅ Direct |
| `notes` | `WorkoutLog.notes` | ✅ Direct |
| `sets[].exerciseId` | `WorkoutSet.exerciseId` | ✅ Direct |
| `sets[].setNumber` | `WorkoutSet.setNumber` | ✅ Direct |
| `sets[].targetReps` | `WorkoutSet.targetReps` | Convert string → number (workoutRepo) |
| `sets[].actualReps` | `WorkoutSet.actualReps` | Convert string → number (workoutRepo) |
| `sets[].targetWeight` | `WorkoutSet.targetWeight` | Convert string → number (workoutRepo) |
| `sets[].actualWeight` | `WorkoutSet.actualWeight` | Convert string → number (workoutRepo) |
| `sets[].rpe` | `WorkoutSet.rpe` | ✅ Direct |
| `sets[].completed` | `WorkoutSet.completed` | ✅ Direct |

### **Derived/Calculated Fields**

| Database Field | Source | Calculation |
|----------------|--------|-------------|
| `WorkoutLog.duration` | `startTime`, `endTime` | `(endTime - startTime) / 60000` (minutes) |
| `WorkoutLog.totalVolume` | `WorkoutSet[]` | Sum of `(actualWeight * actualReps)` for all sets |
| `WorkoutLogExercise` | `WorkoutSet[]` | Group sets by `exerciseId`, aggregate counts/avg |

### **Lost Data (Not Syncable)**

| Offline Field | Reason | Impact |
|---------------|--------|--------|
| `templateId` | Not in schema | Low (can infer from `planDayId` → `PlanDay` → `Plan`) |
| `programRef` | Not in schema | Low (can infer from `planDayId`) |
| `programName` | Not in schema | Low (can infer from `planDayId`) |
| `programDayIndex` | Not in schema | Low (can infer from `planDayId`) |
| `programDayLabel` | Not in schema | Low (can infer from `planDayId`) |
| `exerciseName` | Denormalized | None (use `exerciseId` relation) |
| `restTimer` | Workout-level | Medium (could map to last set's `restSeconds`) |

---

## 🔍 Existing Sync Infrastructure

### **Already Implemented:**
- ✅ `OfflineWorkoutLog.synced: boolean` flag
- ✅ `markOfflineWorkoutLogSynced()` function in `guest/storage.ts`
- ✅ `offlineWorkoutLogQueue` storage mechanism
- ✅ Queue management functions (`readOfflineWorkoutLogQueue`, `appendOfflineWorkoutLog`, etc.)

### **Missing:**
- ❌ Actual sync endpoint (`syncFromOffline` tRPC procedure)
- ❌ Frontend sync hook (`useSyncWorkouts`)
- ❌ Sync trigger points (login, portal entry)
- ❌ Data transformation logic (offline → DB format)

**Status:** Infrastructure exists, but sync implementation is incomplete.

---

## 🎯 Sync Implementation Plan

### **Phase 1: Schema Alignment (Optional Enhancements)**

#### **Option A: Minimal (Recommended)**
- ✅ Keep current schema
- ✅ Store program metadata in `notes` as JSON (if needed)
- ✅ Calculate `duration` and `totalVolume` during sync

#### **Option B: Enhanced Schema**
Add optional fields to `WorkoutLog`:
```prisma
model WorkoutLog {
  // ... existing fields
  templateId      String?  // Optional: template ID if from template
  programRefType  String?  // "template" | "custom"
  programRefId    String?  // Program ID
  programDayIndex Int?     // 1-7
  programName     String?  // For display
}
```

**Decision:** Start with **Option A** (minimal). Add Option B later if needed.

---

### **Phase 2: Sync Function Implementation**

#### **2.1 Create Sync Endpoint**

**File:** `src/server/api/routers/workout-log.ts`

Add new procedure:
```typescript
syncFromOffline: publicProcedure
  .input(
    z.object({
      userId: z.string().min(1),
      workouts: z.array(
        z.object({
          // Offline workout structure
          id: z.string(), // Local UUID (discard, generate new)
          planDayId: z.string().nullish(),
          date: z.string(), // ISO
          startTime: z.string(), // ISO
          endTime: z.string().nullish(), // ISO
          completed: z.boolean(),
          notes: z.string().nullish(),
          sets: z.array(
            z.object({
              exerciseId: z.string(),
              setNumber: z.number(),
              targetReps: z.number().nullish(),
              actualReps: z.number(),
              targetWeight: z.number().nullish(),
              actualWeight: z.number().nullish(),
              rpe: z.number().nullish(),
              completed: z.boolean(),
            })
          ),
        })
      ),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // For each workout:
    // 1. Create WorkoutLog
    // 2. Group sets by exerciseId → create WorkoutLogExercise
    // 3. Create WorkoutSet for each set
    // 4. Calculate duration and totalVolume
    // 5. Return synced workout IDs
  })
```

#### **2.2 Data Transformation Logic**

**Steps:**
1. **Convert types:** String → Number for reps/weight (if from workoutRepo)
2. **Normalize dates:** ISO strings → DateTime
3. **Group sets by exercise:** Create `WorkoutLogExercise` aggregates
4. **Calculate derived fields:** `duration`, `totalVolume`
5. **Handle conflicts:** Check for existing workouts by `date` + `userId`

---

### **Phase 3: Frontend Sync Hook**

**File:** `src/hooks/useSyncWorkouts.ts`

```typescript
export function useSyncWorkouts() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const syncMutation = api.workoutLog.syncFromOffline.useMutation();
  
  const syncOfflineWorkouts = useCallback(async () => {
    if (!userId) return;
    
    // Get offline workouts from workoutRepo
    const history = workoutRepo.getHistory();
    const unsynced = history.filter(/* not synced */);
    
    // Transform to sync format
    const workouts = unsynced.map(transformOfflineToSync);
    
    // Call sync endpoint
    await syncMutation.mutateAsync({ userId, workouts });
    
    // Mark as synced in local storage
    // Clear local history (optional)
  }, [userId, syncMutation]);
  
  return { syncOfflineWorkouts, isSyncing: syncMutation.isPending };
}
```

---

### **Phase 4: Sync Trigger Points**

1. **On Login:** Automatically sync when user logs in
2. **On Portal Entry:** When user navigates to `/portal/train`
3. **Manual Sync:** Button in settings/account page
4. **Background Sync:** Periodically when online

---

## 📊 Sync Flow Diagram

```
┌─────────────────┐
│  Offline /train │
│  (LocalStorage) │
└────────┬────────┘
         │
         │ User logs in / enters portal
         ▼
┌─────────────────┐
│  Sync Function  │
│  (Frontend)     │
└────────┬────────┘
         │
         │ Transform offline → DB format
         ▼
┌─────────────────┐
│  Sync Endpoint  │
│  (tRPC)         │
└────────┬────────┘
         │
         │ Create WorkoutLog + Sets
         ▼
┌─────────────────┐
│   Database      │
│   (PostgreSQL)  │
└─────────────────┘
```

---

## 🔧 Implementation Checklist

### **Schema Alignment**
- [ ] **Decision:** Option A (minimal) or Option B (enhanced)
- [ ] If Option B: Add migration for new `WorkoutLog` fields
- [ ] Document program metadata storage strategy

### **Backend (tRPC)**
- [x] Create `syncFromOffline` procedure in `workout-log.ts`
- [x] Implement data transformation (string → number, ISO → DateTime)
- [x] Implement `WorkoutLogExercise` aggregation from sets
- [x] Calculate `duration` and `totalVolume`
- [x] Handle conflicts (duplicate workouts by date)
- [x] Return synced workout IDs

### **Frontend (Hooks)**
- [x] Create `useSyncWorkouts` hook
- [x] Transform `workoutRepo` format → sync format
- [x] Transform `OfflineWorkoutLog` format → sync format
- [x] Use existing `markOfflineWorkoutLogSynced()` for guest logs
- [x] Handle sync errors and retries
- [x] Mark workouts as synced in local storage (for OfflineWorkoutLog)
- [x] Use existing `offlineWorkoutLogQueue` infrastructure

### **UI Integration**
- [x] Add sync trigger on portal entry (`SyncWorkoutsTrigger` component)
- [x] Add manual sync button (account page `SyncCard`)
- [x] Show sync status/progress (toast notifications)
- [x] Handle sync conflicts (skips duplicates, reports errors)

### **Testing**
- [ ] Test sync with workoutRepo format (strings)
- [ ] Test sync with OfflineWorkoutLog format (numbers)
- [ ] Test conflict handling (duplicate dates)
- [ ] Test partial sync (some workouts fail)
- [ ] Test offline → online transition

---

## ⚠️ Known Limitations

1. **Program metadata loss:** `templateId`, `programRef`, `programName` not stored in DB
   - **Workaround:** Can infer from `planDayId` → `PlanDay` → `Plan`
   - **Impact:** Low (metadata is for display, not critical)

2. **Rest timer:** Workout-level timer not stored
   - **Workaround:** Could store in last set's `restSeconds` or ignore
   - **Impact:** Medium (nice-to-have feature)

3. **Exercise names:** Denormalized in offline, normalized in DB
   - **Workaround:** Lookup via `exerciseId` relation
   - **Impact:** None (DB structure is better)

4. **String vs Number:** workoutRepo uses strings, DB uses numbers
   - **Workaround:** Convert during sync
   - **Impact:** Low (transformation is straightforward)

---

## ✅ Alignment Summary

| Category | Status | Notes |
|----------|--------|-------|
| **Core Fields** | ✅ **ALIGNED** | date, startTime, endTime, completed, notes |
| **Sets Data** | ✅ **ALIGNED** | All set fields map correctly (with type conversion) |
| **Program Metadata** | ⚠️ **PARTIAL** | Not in DB, but can infer from `planDayId` |
| **Derived Fields** | ✅ **CALCULABLE** | duration, totalVolume can be computed |
| **Aggregate Structure** | ✅ **DERIVABLE** | WorkoutLogExercise can be created from sets |
| **Overall Syncability** | ✅ **FEASIBLE** | Can sync with minor transformations |

---

## ✅ Implementation Summary

### **Completed Implementation:**

1. **✅ Sync Endpoint** (`src/server/api/routers/workout-log.ts`)
   - `syncFromOffline` procedure handles both formats
   - Transforms string → number for workoutRepo format
   - Creates `WorkoutLog`, `WorkoutLogExercise`, and `WorkoutSet` records
   - Calculates `duration` and `totalVolume`
   - Handles conflicts (skips duplicates by date)

2. **✅ Sync Hook** (`src/hooks/useSyncWorkouts.ts`)
   - Transforms both `workoutRepo` and `OfflineWorkoutLog` formats
   - Uses existing `offlineWorkoutLogQueue` infrastructure
   - Marks guest logs as synced after successful sync
   - Returns sync status and error handling

3. **✅ Auto-Sync Trigger** (`src/components/sync/SyncWorkoutsTrigger.tsx`)
   - Automatically syncs when user enters portal
   - Runs once per session
   - Shows toast notifications for success/failure

4. **✅ Manual Sync UI** (`src/app/portal/account/_parts/sync-card.tsx`)
   - Sync card in account page
   - Shows unsynced count
   - Manual sync button with status

### **Files Created/Modified:**
- ✅ `src/server/api/routers/workout-log.ts` - Added `syncFromOffline` procedure
- ✅ `src/hooks/useSyncWorkouts.ts` - New sync hook
- ✅ `src/components/sync/SyncWorkoutsTrigger.tsx` - Auto-sync component
- ✅ `src/app/portal/account/_parts/sync-card.tsx` - Manual sync UI
- ✅ `src/app/portal/layout.tsx` - Added `SyncWorkoutsTrigger`
- ✅ `src/app/portal/account/_parts/account-form.tsx` - Added `SyncCard`

## 🎯 Next Steps (Optional Enhancements)

1. **Add synced flag to workoutRepo** - Currently syncs all completed workouts
2. **Background sync** - Periodically sync when online
3. **Sync progress indicator** - Show detailed progress for large syncs
4. **Conflict resolution UI** - Let user choose which workout to keep
5. **Schema enhancement** - Optionally add program metadata fields

---

**Conclusion:** Train data **IS syncable** with minor transformations. The schema is well-aligned for core workout data. Program metadata can be inferred or stored optionally. Ready to implement sync functionality.

---

## 📋 Quick Summary

### **✅ Alignment Status: GOOD**

| Aspect | Status | Details |
|--------|--------|---------|
| **Core Fields** | ✅ Aligned | date, startTime, endTime, completed, notes all match |
| **Sets Data** | ✅ Aligned | All set fields syncable (with type conversion) |
| **Schema Structure** | ✅ Compatible | DB structure supports offline data |
| **Sync Infrastructure** | ⚠️ Partial | Queue exists, but no sync endpoint |
| **Overall** | ✅ **SYNCABLE** | Ready for implementation |

### **🔧 Required Transformations**

1. **Type Conversion:** String → Number (for workoutRepo format)
2. **Date Conversion:** ISO string → DateTime
3. **Aggregation:** Create `WorkoutLogExercise` from sets
4. **Calculations:** Compute `duration` and `totalVolume`

### **📝 Implementation Priority**

1. **High Priority:**
   - Create `syncFromOffline` tRPC endpoint
   - Transform `OfflineWorkoutLog` format (guest mode)
   - Transform `workoutRepo` format (train mode)
   - Handle conflicts (duplicate dates)

2. **Medium Priority:**
   - Add sync trigger on login
   - Add sync trigger on `/portal/train` entry
   - Show sync status/progress

3. **Low Priority:**
   - Store program metadata (optional schema enhancement)
   - Map rest timer to sets
   - Manual sync button in settings

### **🎯 Recommended Approach**

**Start with minimal viable sync:**
1. Sync `OfflineWorkoutLog` format (guest mode) - numbers already
2. Add type conversion for `workoutRepo` format (train mode) - strings → numbers
3. Use existing `offlineWorkoutLogQueue` infrastructure
4. Calculate `duration` and `totalVolume` during sync
5. Skip program metadata for now (can infer from `planDayId`)

**This approach:**
- ✅ Works with existing infrastructure
- ✅ Minimal schema changes
- ✅ Handles both offline formats
- ✅ Can be enhanced later
