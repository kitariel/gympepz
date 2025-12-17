# ⚠️ Database Migration Required

## 🔴 **Current Issue:**

The application code includes new features (WorkoutSet, ExercisePR, WorkoutStreak models) but the **database hasn't been migrated** yet.

---

## ✅ **Temporary Fix Applied**

I've updated the tRPC routers to work with the **current database schema** so the app runs without errors:

### **Changes Made:**
1. **workout-log.ts**: Removed `sets` includes, using `exercises` instead
2. **getAnalytics**: Changed from `sets` to `exercises`
3. **getWithHistory**: Changed from `sets` to `exercises`  
4. **calendar**: Changed `_count: { sets }` to `_count: { exercises }`

**Result:** App now works with existing schema ✅

---

## 🚀 **To Enable Full Features (Run Migrations)**

To get all the new features working properly, run these commands:

### **Step 1: Generate Prisma Client**
```bash
pnpm db:generate
```

### **Step 2: Create & Run Migration**
```bash
pnpm prisma migrate dev --name add_workout_sets_and_tracking
```

This will:
- Create `WorkoutSet` table
- Create `ExercisePR` table
- Create `WorkoutStreak` table
- Add `sets` relation to `WorkoutLog`
- Add `prs` relation to `User`
- Update all foreign keys

### **Step 3: Restart Dev Server**
```bash
pnpm dev
```

---

## 📋 **What Will Be Added**

### **New Tables:**

**1. WorkoutSet**
- Granular set-by-set tracking
- Actual vs target reps/weight
- RPE (Rate of Perceived Exertion)
- Rest time between sets
- Individual set notes

**2. ExercisePR**
- Personal records per exercise
- Max weight, volume, 1RM
- Automatic PR detection
- Historical tracking

**3. WorkoutStreak**
- Current streak counter
- Longest streak record
- Last workout date
- Automatic updates

---

## 🔄 **After Migration**

Once migrated, you can **revert the temporary fixes** and use the full feature set:

### **Restore Full Functionality:**
1. Set-by-set workout tracking
2. Automatic PR detection
3. Streak calculations
4. Volume load tracking
5. 1RM estimations
6. Advanced analytics

---

## 📊 **Schema Changes Summary**

```prisma
// NEW MODELS

model WorkoutSet {
  id           String   @id @default(cuid())
  workoutLogId String
  exerciseId   String
  setNumber    Int
  targetReps   Int?
  actualReps   Int
  targetWeight Float?
  actualWeight Float?
  rpe          Int?
  completed    Boolean  @default(false)
  restSeconds  Int?
  notes        String?
  createdAt    DateTime @default(now())
  
  workoutLog WorkoutLog @relation(fields: [workoutLogId], references: [id])
  exercise   Exercise   @relation(fields: [exerciseId], references: [id])
}

model ExercisePR {
  id           String      @id @default(cuid())
  userId       String
  exerciseId   String
  prType       String
  value        Float
  reps         Int?
  date         DateTime
  workoutLogId String?
  notes        String?
  createdAt    DateTime    @default(now())
  
  user       User        @relation(fields: [userId], references: [id])
  exercise   Exercise    @relation(fields: [exerciseId], references: [id])
  workoutLog WorkoutLog? @relation(fields: [workoutLogId], references: [id])
}

model WorkoutStreak {
  id            String    @id @default(cuid())
  userId        String    @unique
  currentStreak Int       @default(0)
  longestStreak Int       @default(0)
  lastWorkout   DateTime?
  updatedAt     DateTime  @updatedAt
  
  user User @relation(fields: [userId], references: [id])
}

// UPDATED MODELS

model WorkoutLog {
  // ... existing fields ...
  sets      WorkoutSet[]   // NEW
  prs       ExercisePR[]   // NEW
  totalVolume Float?       // NEW
}

model User {
  // ... existing fields ...
  prs    ExercisePR[]      // NEW
  streak WorkoutStreak?    // NEW
}

model Exercise {
  // ... existing fields ...
  workoutSets WorkoutSet[]  // NEW
  prs         ExercisePR[]  // NEW
}
```

---

## ⚠️ **Important Notes**

### **1. Backup First (Production)**
If running on production data:
```bash
# Backup your database first
pg_dump your_database > backup.sql
```

### **2. Development**
Safe to run directly - no data loss risk

### **3. Check Existing Data**
The migration will:
- ✅ Preserve all existing `WorkoutLog` records
- ✅ Preserve all `User` data
- ✅ Create new empty tables
- ✅ Add new columns with default values

### **4. Seed Data (Optional)**
After migration, you might want to:
- Create sample WorkoutSets from existing logs
- Initialize streaks for existing users
- Backfill PRs from workout history

---

## 🎯 **Current Status**

| Feature | Without Migration | After Migration |
|---------|------------------|-----------------|
| **View Workouts** | ✅ Works | ✅ Better |
| **Log Workouts** | ✅ Works | ✅ Better |
| **Weekly Calendar** | ✅ Works | ✅ Works |
| **Set-by-Set Tracking** | ❌ Basic | ✅ Full |
| **PR Detection** | ❌ Manual | ✅ Automatic |
| **Streak Tracking** | ⚠️ Calculated | ✅ Real-time |
| **Volume Tracking** | ⚠️ Estimated | ✅ Accurate |
| **Analytics** | ⚠️ Limited | ✅ Complete |

---

## 🔧 **Troubleshooting**

### **Error: Migration Failed**
```bash
# Reset database (CAUTION: Loses data!)
pnpm prisma migrate reset

# Or, resolve conflicts manually
pnpm prisma migrate resolve
```

### **Error: Client Out of Sync**
```bash
# Regenerate Prisma Client
pnpm db:generate
pnpm prisma generate
```

### **Error: Connection Issues**
Check `.env` file has:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
```

---

## 📚 **Documentation References**

- **Schema Details**: See `Schema.md`
- **API Endpoints**: See `Api.md`
- **Enhancement Summary**: See `LOG_ROUTE_ENHANCEMENT_SUMMARY.md`

---

## ✅ **Quick Start (Recommended)**

**Just Run These 3 Commands:**

```bash
# 1. Generate Prisma client with new schema
pnpm db:generate

# 2. Create and run migration
pnpm prisma migrate dev --name full_workout_tracking

# 3. Restart dev server
pnpm dev
```

**That's it!** All features will be unlocked 🎉

---

## 🎊 **After Migration Benefits**

You'll get access to:
- ✅ **Real-time PR detection** as you log sets
- ✅ **Accurate volume calculations** per workout
- ✅ **Automatic streak updates** every workout
- ✅ **Set-by-set analysis** and progress
- ✅ **RPE tracking** for intensity
- ✅ **1RM estimations** from your sets
- ✅ **Advanced analytics** dashboards
- ✅ **Granular progress tracking**

**Your app will transform from good → amazing! 🚀**
