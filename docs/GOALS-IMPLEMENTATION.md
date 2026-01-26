# Goals Feature – Step-by-Step Implementation Guide

**Feature:** User goals system (strength, reps, consistency, bodyweight goals)  
**Priority:** Phase 1 – Foundation  
**Reference:** See `ARCHITECTURE-ALIGNMENT.md` Section 9.1

---

## 🔄 Plan Revision: Train Outside = Offline, Train + Goals Inside Portal = Synced

**Train outside portal = offline mode.** **Train + Goals inside portal = synced mode.** When users log in, they use train and goals **inside the portal**; data syncs. Offline train stays standalone.

### **Route structure**

| Context | Route | Purpose |
|--------|--------|---------|
| **Outside portal (offline)** | `/train` | Offline train. Own layout. Local storage. No login. |
| **Inside portal (synced)** | `/portal/train` | Train inside portal. Portal layout. API, DB. Sync. |
| **Inside portal (synced)** | `/portal/goals` | Goals dashboard, create, detail. Portal layout. API, DB. |

**Train**

- **`/train`** — **Offline mode.** Standalone app. `TrainHeader`, `TrainBottomNav`, `WorkoutSessionDock`. Local storage (e.g. guest storage, `workoutRepo`). Works without login.
- **`/portal/train`** — **Synced mode.** Train experience **inside** portal. Uses **portal layout** (sidebar, `PortalHeader`, `MobileBottomNav`). Uses API, DB. When logged in, use this. Same train UX (log, history, plans, …) but persisted and synced.

**Goals**

- **`/portal/goals`** — Goals dashboard (active + completed)
- **`/portal/goals/new`** — Create goal
- **`/portal/goals/[goalId]`** — Goal detail + progress

Goals live **only inside portal**. No standalone `/goals`. They use the **portal layout** (no separate Goals layout).

### **Sync process**

1. **Offline usage:** User uses `/train` without logging in. Workouts, plans, etc. live in **local storage** (e.g. `workoutRepo`, `programRepo`, guest storage).
2. **Login / online:** User logs in and uses **`/portal/train`** (and `/portal/goals`). Data is stored via **API / DB**.
3. **Sync:** When transitioning from offline → logged-in (e.g. user logs in after using `/train` offline):
   - **Upload local → server:** Sync local workout logs, plans, etc. to the backend (e.g. on login or when opening `/portal/train`).
   - **Conflict handling:** Define rules (e.g. last-write-wins, or merge) for duplicates.
4. **Goals:** Always synced; they live only in portal. No offline goals layer for now.

### **Layout & navigation**

- **`/train` (offline)** → `app/train/layout.tsx`: `TrainHeader`, `TrainBottomNav`, `WorkoutSessionDock`. **No portal.**
- **`/portal/train`** → **Portal layout.** Sidebar, `PortalHeader`, `MobileBottomNav`. Train pages rendered inside portal.
- **`/portal/goals`** → **Portal layout.** Same as portal train. Goals pages inside portal.

**Nav**

- Portal sidebar / `MobileBottomNav`: link to **`/portal/train`** (synced train) and **`/portal/goals`**.
- Offline `/train`: optionally link to **`/login`** or **`/portal`** to “go online” / sync.

### **When Train and Goals connect**

- **Portal train → Goals:** After completing a workout in **`/portal/train`**, optionally `recordProgress` for matching goals (e.g. same exercise).
- **Goals → Portal train:** Links like “Start today’s workout” → **`/portal/train/log`** (or equivalent).

### **File structure (revised)**

```
app/
├── train/                        # Offline train (outside portal)
│   ├── layout.tsx                # TrainHeader, TrainBottomNav, WorkoutSessionDock
│   ├── page.tsx
│   ├── log/
│   ├── history/
│   ├── plans/
│   ├── templates/
│   └── ...                       # No goals here
│
└── portal/
    ├── layout.tsx                # Sidebar, PortalHeader, MobileBottomNav
    ├── page.tsx
    ├── train/                    # Train inside portal (synced)
    │   ├── page.tsx              # /portal/train
    │   ├── log/
    │   ├── history/
    │   ├── plans/
    │   ├── templates/
    │   └── ...
    ├── goals/                    # Goals inside portal (synced)
    │   ├── page.tsx              # /portal/goals
    │   ├── new/
    │   │   └── page.tsx          # /portal/goals/new
    │   └── [goalId]/
    │       └── page.tsx          # /portal/goals/[goalId]
    ├── ai-planner/
    ├── exercises/
    └── account/

features/
├── train/
│   └── components/               # WorkoutLogger, HistoryList, … (shared by /train and /portal/train)
└── goals/
    └── components/               # GoalCard, GoalProgress, … (used only in /portal/goals)
```

### **Summary**

- **`/train`** = offline train. Own layout. Local storage. No login.
- **`/portal/train`** = synced train. Portal layout. API, DB. Sync when logged in.
- **`/portal/goals`** = goals. Portal layout only. Synced. No standalone goals.
- **Sync** = offline train data → server when user logs in / uses `/portal/train`.
- **Integration** = portal train ↔ goals (e.g. `recordProgress`, “Start workout” links).

---

## 🎯 Best Practices (Always Follow)

### **1. Split Coding & Separation of Concerns**

**Rule:** Every feature component MUST follow this structure:

```
ComponentName/
├── ComponentName.tsx           # 🎨 VIEW ONLY (Pure UI, no logic)
├── ComponentName.container.tsx # 🧠 LOGIC ONLY (Data, state, handlers)
├── ComponentName.types.ts      # 📝 TypeScript types
└── index.ts                    # 📦 Re-exports
```

**Why:**
- **View** = Easy to redesign without touching logic
- **Container** = Easy to test business logic separately
- **Types** = Single source of truth for TypeScript
- **Re-exports** = Clean imports (`import { Component } from './ComponentName'`)

### **2. View and Logic Separation**

**View Component (`ComponentName.tsx`):**
- ✅ Receives props (view model)
- ✅ Renders UI only
- ✅ No hooks (except UI hooks like `useState` for local UI state)
- ✅ No API calls
- ✅ No business logic
- ✅ Pure function (same props = same output)

**Container Component (`ComponentName.container.tsx`):**
- ✅ All hooks (`useQuery`, `useMutation`, `useState`, etc.)
- ✅ All API calls (tRPC, fetch, etc.)
- ✅ Business logic (transformations, calculations)
- ✅ Event handlers
- ✅ Transforms data → view model
- ✅ Passes view model to View component

**Example Pattern:**
```typescript
// Container: Handles logic
export function GoalCardContainer({ goalId }: { goalId: string }) {
  const { data: goal } = api.goal.getById.useQuery({ id: goalId });
  const progress = useMemo(() => calculateProgress(goal), [goal]);
  
  const viewModel: GoalCardViewModel = {
    title: goal?.name,
    progress: progress.percentage,
    // ... transform data for view
  };
  
  return <GoalCard {...viewModel} />;
}

// View: Pure UI
export function GoalCard({ title, progress }: GoalCardViewModel) {
  return <Card>{/* UI only */}</Card>;
}
```

### **3. Provider/Context Pattern (When Needed)**

**Use Context/Provider when:**
- ✅ Multiple components need same data (avoid prop drilling)
- ✅ Data needs to be shared across route boundaries
- ✅ Complex state management (e.g., form state, multi-step flows)

**Example:**
```typescript
// GoalProvider.tsx
export function GoalProvider({ children }: { children: ReactNode }) {
  const { data: goals } = api.goal.getAll.useQuery();
  const value = { goals, /* ... */ };
  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
}

// Use in container
export function GoalCardContainer() {
  const { goals } = useGoalContext(); // Instead of prop drilling
  // ...
}
```

**Don't use Context for:**
- ❌ Simple parent-child props (just pass props)
- ❌ Single component state (use `useState`)
- ❌ Server data (use tRPC hooks directly)

---

## 📋 Implementation Steps

### **Step 1: Database Schema (Prisma)**

**File:** `prisma/schema/goal.prisma`

```prisma
model Goal {
  id           String    @id @default(cuid())
  userId       String
  type         String    // "strength" | "reps" | "consistency" | "bodyweight"
  exerciseId   String?   // For strength/reps goals
  targetValue  Float     // Target weight/reps/workouts
  currentValue Float     @default(0)
  unit         String    // "lbs" | "kg" | "reps" | "workouts"
  deadline     DateTime?
  status       String    @default("active") // "active" | "completed" | "abandoned"
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  completedAt  DateTime?

  user     User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  exercise Exercise?      @relation(fields: [exerciseId], references: [id], onDelete: SetNull)
  progress GoalProgress[] // Track progress over time

  @@index([userId, status])
  @@index([userId, type])
}

model GoalProgress {
  id        String   @id @default(cuid())
  goalId    String
  value     Float    // Progress value at this point
  date      DateTime @default(now())
  notes     String?
  createdAt DateTime @default(now())

  goal Goal @relation(fields: [goalId], references: [id], onDelete: Cascade)

  @@index([goalId, date])
}
```

**Actions:**
1. Create `prisma/schema/goal.prisma`
2. Add to `prisma/schema/schema.prisma`: `model Goal` and `model GoalProgress`
3. Add relation to `User` model: `goals Goal[]`
4. Add relation to `Exercise` model: `goals Goal[]` (optional)
5. Run migration: `pnpm db:generate` then `pnpm db:push`

---

### **Step 2: TypeScript Types**

**File:** `src/types/goal.types.ts`

```typescript
export type GoalType = "strength" | "reps" | "consistency" | "bodyweight";

export type GoalStatus = "active" | "completed" | "abandoned";

export type GoalUnit = "lbs" | "kg" | "reps" | "workouts";

export interface Goal {
  id: string;
  userId: string;
  type: GoalType;
  exerciseId?: string | null;
  targetValue: number;
  currentValue: number;
  unit: GoalUnit;
  deadline?: Date | null;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  exercise?: {
    id: string;
    name: string;
  } | null;
}

export interface GoalProgress {
  id: string;
  goalId: string;
  value: number;
  date: Date;
  notes?: string | null;
  createdAt: Date;
}

export interface GoalProgressData {
  goalId: string;
  percentage: number;
  remaining: number;
  trend: "improving" | "declining" | "stable";
  projectedCompletion?: Date;
  history: GoalProgress[];
}
```

**Actions:**
1. Create `src/types/goal.types.ts`
2. Export types for use in components/services

---

### **Step 3: tRPC Router**

**File:** `src/server/api/routers/goal.ts`

```typescript
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { db } from "@/server/db";

const CreateGoalInput = z.object({
  type: z.enum(["strength", "reps", "consistency", "bodyweight"]),
  exerciseId: z.string().optional(),
  targetValue: z.number().min(0),
  unit: z.enum(["lbs", "kg", "reps", "workouts"]),
  deadline: z.date().optional(),
});

const UpdateGoalInput = z.object({
  id: z.string(),
  targetValue: z.number().min(0).optional(),
  deadline: z.date().optional(),
  status: z.enum(["active", "completed", "abandoned"]).optional(),
});

export const goalRouter = createTRPCRouter({
  // Get all goals for user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const goals = await db.goal.findMany({
      where: { userId: ctx.session.user.id },
      include: { exercise: true },
      orderBy: { createdAt: "desc" },
    });
    return goals;
  }),

  // Get single goal
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const goal = await db.goal.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          exercise: true,
          progress: {
            orderBy: { date: "desc" },
            take: 30, // Last 30 progress entries
          },
        },
      });
      return goal;
    }),

  // Create goal
  create: protectedProcedure
    .input(CreateGoalInput)
    .mutation(async ({ ctx, input }) => {
      const goal = await db.goal.create({
        data: {
          userId: ctx.session.user.id,
          type: input.type,
          exerciseId: input.exerciseId,
          targetValue: input.targetValue,
          unit: input.unit,
          deadline: input.deadline,
          currentValue: 0,
          status: "active",
        },
        include: { exercise: true },
      });
      return goal;
    }),

  // Update goal
  update: protectedProcedure
    .input(UpdateGoalInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const goal = await db.goal.update({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data,
        include: { exercise: true },
      });
      return goal;
    }),

  // Delete goal
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.goal.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
      return { success: true };
    }),

  // Get progress data for goal
  getProgress: protectedProcedure
    .input(z.object({ goalId: z.string() }))
    .query(async ({ ctx, input }) => {
      const goal = await db.goal.findFirst({
        where: {
          id: input.goalId,
          userId: ctx.session.user.id,
        },
        include: {
          progress: {
            orderBy: { date: "asc" },
          },
        },
      });

      if (!goal) return null;

      const percentage = (goal.currentValue / goal.targetValue) * 100;
      const remaining = goal.targetValue - goal.currentValue;

      // Calculate trend (simplified - compare last 2 progress entries)
      let trend: "improving" | "declining" | "stable" = "stable";
      if (goal.progress.length >= 2) {
        const recent = goal.progress.slice(-2);
        if (recent[1]!.value > recent[0]!.value) trend = "improving";
        else if (recent[1]!.value < recent[0]!.value) trend = "declining";
      }

      return {
        goalId: goal.id,
        percentage: Math.min(100, Math.max(0, percentage)),
        remaining,
        trend,
        history: goal.progress,
      };
    }),

  // Record progress (called after workout completion)
  recordProgress: protectedProcedure
    .input(
      z.object({
        goalId: z.string(),
        value: z.number(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create progress entry
      await db.goalProgress.create({
        data: {
          goalId: input.goalId,
          value: input.value,
          notes: input.notes,
        },
      });

      // Update goal current value
      const goal = await db.goal.update({
        where: {
          id: input.goalId,
          userId: ctx.session.user.id,
        },
        data: {
          currentValue: input.value,
          // Auto-complete if target reached
          status:
            input.value >= (await db.goal.findUnique({ where: { id: input.goalId } }))!.targetValue
              ? "completed"
              : undefined,
          completedAt:
            input.value >= (await db.goal.findUnique({ where: { id: input.goalId } }))!.targetValue
              ? new Date()
              : undefined,
        },
      });

      return goal;
    }),
});
```

**Actions:**
1. Create `src/server/api/routers/goal.ts`
2. Add to `src/server/api/root.ts`:
   ```typescript
   import { goalRouter } from "./routers/goal";
   
   export const appRouter = createTRPCRouter({
     // ... existing routers
     goal: goalRouter,
   });
   ```

---

### **Step 4: Custom Hook**

**File:** `src/hooks/useGoals.ts`

```typescript
"use client";

import { useMemo } from "react";
import { api } from "@/trpc/react";
import type { Goal, GoalType, GoalStatus } from "@/types/goal.types";

export function useGoals() {
  const { data: goals, isLoading, error, refetch } = api.goal.getAll.useQuery();

  const activeGoals = useMemo(
    () => goals?.filter((g) => g.status === "active") ?? [],
    [goals],
  );

  const completedGoals = useMemo(
    () => goals?.filter((g) => g.status === "completed") ?? [],
    [goals],
  );

  const goalsByType = useMemo(
    () =>
      goals?.reduce(
        (acc, goal) => {
          if (!acc[goal.type]) acc[goal.type] = [];
          acc[goal.type]!.push(goal);
          return acc;
        },
        {} as Record<GoalType, Goal[]>,
      ) ?? {},
    [goals],
  );

  return {
    goals: goals ?? [],
    activeGoals,
    completedGoals,
    goalsByType,
    isLoading,
    error,
    refetch,
  };
}

export function useGoal(goalId: string) {
  const { data: goal, isLoading, error, refetch } = api.goal.getById.useQuery({
    id: goalId,
  });

  const { data: progress } = api.goal.getProgress.useQuery(
    { goalId },
    { enabled: !!goalId },
  );

  return {
    goal,
    progress,
    isLoading,
    error,
    refetch,
  };
}

export function useGoalMutations() {
  const utils = api.useUtils();
  const createMutation = api.goal.create.useMutation({
    onSuccess: () => {
      utils.goal.getAll.invalidate();
    },
  });

  const updateMutation = api.goal.update.useMutation({
    onSuccess: () => {
      utils.goal.getAll.invalidate();
      utils.goal.getById.invalidate();
    },
  });

  const deleteMutation = api.goal.delete.useMutation({
    onSuccess: () => {
      utils.goal.getAll.invalidate();
    },
  });

  const recordProgressMutation = api.goal.recordProgress.useMutation({
    onSuccess: () => {
      utils.goal.getById.invalidate();
      utils.goal.getProgress.invalidate();
    },
  });

  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    recordProgress: recordProgressMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
```

**Actions:**
1. Create `src/hooks/useGoals.ts`
2. Export hooks for use in containers

---

### **Step 5: GoalCard Component (View/Container/Types)**

**File Structure:**
```
src/features/goals/components/GoalCard/
├── GoalCard.types.ts
├── GoalCard.container.tsx
├── GoalCard.view.tsx
└── index.ts
```

#### **5.1 Types**

**File:** `src/features/goals/components/GoalCard/GoalCard.types.ts`

```typescript
import type { Goal } from "@/types/goal.types";

export interface GoalCardViewModel {
  id: string;
  title: string;
  subtitle: string;
  progress: number; // 0-100
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline?: Date | null;
  status: "active" | "completed" | "abandoned";
  trend?: "improving" | "declining" | "stable";
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface GoalCardProps {
  goal: Goal;
  onView?: (goalId: string) => void;
  onEdit?: (goalId: string) => void;
  onDelete?: (goalId: string) => void;
}
```

#### **5.2 Container**

**File:** `src/features/goals/components/GoalCard/GoalCard.container.tsx`

```typescript
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGoal } from "@/hooks/useGoals";
import type { GoalCardProps, GoalCardViewModel } from "./GoalCard.types";
import { GoalCardView } from "./GoalCard.view";

export function GoalCardContainer({
  goal,
  onView,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const router = useRouter();
  const { progress } = useGoal(goal.id);

  const viewModel: GoalCardViewModel = useMemo(() => {
    const progressPercentage = progress?.percentage ?? 0;
    const exerciseName = goal.exercise?.name ?? "";

    let title = "";
    let subtitle = "";

    switch (goal.type) {
      case "strength":
        title = exerciseName || "Strength Goal";
        subtitle = `${goal.currentValue}${goal.unit} / ${goal.targetValue}${goal.unit}`;
        break;
      case "reps":
        title = exerciseName || "Reps Goal";
        subtitle = `${goal.currentValue} reps / ${goal.targetValue} reps`;
        break;
      case "consistency":
        title = "Consistency Goal";
        subtitle = `${goal.currentValue} workouts / ${goal.targetValue} workouts`;
        break;
      case "bodyweight":
        title = "Bodyweight Goal";
        subtitle = `${goal.currentValue}${goal.unit} / ${goal.targetValue}${goal.unit}`;
        break;
    }

    return {
      id: goal.id,
      title,
      subtitle,
      progress: progressPercentage,
      currentValue: goal.currentValue,
      targetValue: goal.targetValue,
      unit: goal.unit,
      deadline: goal.deadline,
      status: goal.status,
      trend: progress?.trend,
      onView: () => {
        onView?.(goal.id);
        router.push(`/portal/goals/${goal.id}`);
      },
      onEdit: onEdit ? () => onEdit(goal.id) : undefined,
      onDelete: onDelete ? () => onDelete(goal.id) : undefined,
    };
  }, [goal, progress, router, onView, onEdit, onDelete]);

  return <GoalCardView {...viewModel} />;
}
```

#### **5.3 View**

**File:** `src/features/goals/components/GoalCard/GoalCard.view.tsx`

```typescript
"use client";

import { Trophy, TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GoalCardViewModel } from "./GoalCard.types";
import { format } from "date-fns";

export function GoalCardView({
  title,
  subtitle,
  progress,
  deadline,
  status,
  trend,
  onView,
  onEdit,
  onDelete,
}: GoalCardViewModel) {
  const TrendIcon =
    trend === "improving"
      ? TrendingUp
      : trend === "declining"
        ? TrendingDown
        : Minus;

  const trendColor =
    trend === "improving"
      ? "text-green-500"
      : trend === "declining"
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          {status === "completed" && (
            <Trophy className="h-5 w-5 text-yellow-500" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {trend && (
          <div className="flex items-center gap-2 text-sm">
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <span className="text-muted-foreground capitalize">{trend}</span>
          </div>
        )}

        {deadline && status === "active" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Due: {format(new Date(deadline), "MMM d, yyyy")}</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={onView} variant="default" className="flex-1">
            View Details
          </Button>
          {onEdit && (
            <Button onClick={onEdit} variant="outline" size="icon">
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

#### **5.4 Index**

**File:** `src/features/goals/components/GoalCard/index.ts`

```typescript
export { GoalCardContainer as GoalCard } from "./GoalCard.container";
export { GoalCardView } from "./GoalCard.view";
export type { GoalCardProps, GoalCardViewModel } from "./GoalCard.types";
```

**Actions:**
1. Create folder structure `src/features/goals/components/GoalCard/`
2. Create all 4 files following the pattern above
3. Install `date-fns` if not already: `pnpm add date-fns`

---

### **Step 6: GoalProgress Component (View/Container/Types)**

**File Structure:**
```
src/features/goals/components/GoalProgress/
├── GoalProgress.types.ts
├── GoalProgress.container.tsx
├── GoalProgress.view.tsx
└── index.ts
```

**Follow same pattern as GoalCard:**
- **Types:** Define `GoalProgressViewModel` and `GoalProgressProps`
- **Container:** Use `useGoal(goalId)` hook, transform data → view model
- **View:** Render progress chart (use a chart library like `recharts` or simple bar chart)
- **Index:** Re-exports

**Actions:**
1. Create folder structure
2. Implement following GoalCard pattern
3. Optional: Add chart library `pnpm add recharts` for visual progress

---

### **Step 6b: Goals use Portal layout (no separate Goals layout)**

Goals live **inside portal**. They use the **existing portal layout** (sidebar, `PortalHeader`, `MobileBottomNav`). **Do not** create a separate `app/goals/layout.tsx` or `GoalsHeader` / `GoalsNav`.

**Actions:**
1. Place Goals pages under **`app/portal/goals/`** so they inherit **`app/portal/layout.tsx`**.
2. Add **Goals** to portal nav (sidebar and/or `MobileBottomNav`): link to **`/portal/goals`**.
3. Optional: link **“Train”** in portal to **`/portal/train`** (synced) vs **`/train`** (offline) depending on app mode.

---

### **Step 7: Goals Dashboard Page**

**File:** `src/app/portal/goals/page.tsx`

```typescript
"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGoals } from "@/hooks/useGoals";
import { GoalCard } from "@/features/goals/components/GoalCard";
import { useGoalMutations } from "@/hooks/useGoals";

export default function GoalsPage() {
  const { activeGoals, completedGoals, isLoading } = useGoals();
  const { delete: deleteGoal } = useGoalMutations();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Goals</h1>
        <Button asChild>
          <Link href="/portal/goals/new">
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Link>
        </Button>
      </div>

      {activeGoals.length === 0 && completedGoals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No goals yet. Create your first goal to track your progress!
            </p>
            <Button asChild>
              <Link href="/portal/goals/new">Create Goal</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Active Goals</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onDelete={async (id) => {
                      if (confirm("Delete this goal?")) {
                        await deleteGoal({ id });
                      }
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {completedGoals.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Completed Goals</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
```

**Actions:**
1. Create `src/app/portal/goals/page.tsx` (uses portal layout)
2. Add Goals link to portal nav (sidebar / `MobileBottomNav`) → `/portal/goals`

---

### **Step 8: Create Goal Page**

**File:** `src/app/portal/goals/new/page.tsx`

**Follow pattern:**
- Create form component (View/Container/Types)
- Use `useGoalMutations().create`
- Form fields: type, exercise (if strength/reps), target value, unit, deadline
- Redirect to `/portal/goals/[goalId]` on success

**Actions:**
1. Create `src/app/portal/goals/new/page.tsx`
2. Create form component following View/Container pattern

---

### **Step 9: Goal Detail Page**

**File:** `src/app/portal/goals/[goalId]/page.tsx`

```typescript
"use client";

import { use } from "react";
import { useGoal } from "@/hooks/useGoals";
import { GoalProgress } from "@/features/goals/components/GoalProgress";
import { Card, CardContent } from "@/components/ui/card";

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const { goalId } = use(params);
  const { goal, progress, isLoading } = useGoal(goalId);

  if (isLoading) return <div>Loading...</div>;
  if (!goal) return <div>Goal not found</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{goal.exercise?.name || "Goal"}</h1>
      
      <Card>
        <CardContent className="p-6">
          <GoalProgress goalId={goalId} />
        </CardContent>
      </Card>
    </div>
  );
}
```

**Actions:**
1. Create `src/app/portal/goals/[goalId]/page.tsx`
2. Use `GoalProgress` component to show chart. “Back” / breadcrumb → `/portal/goals`

---

### **Step 10: Integration (Portal Train → Goals) + Sync (Offline → Portal)**

**A. Portal train → Goals**

**When:** User completes a workout in **portal train** (`/portal/train/log`).

**File:** `src/features/train/components/WorkoutLogger/WorkoutLogger.container.tsx` (or portal-specific workout logger if split)

**Add after workout completion:**
```typescript
// After workout is saved
const { recordProgress } = useGoalMutations();

// Check if any goals match this workout
const matchingGoals = activeGoals.filter(
  (goal) => goal.exerciseId === exercise.id && goal.type === "strength"
);

// Record progress for matching goals
for (const goal of matchingGoals) {
  await recordProgress({
    goalId: goal.id,
    value: maxWeight, // Calculate from workout sets
    notes: `From workout on ${new Date().toLocaleDateString()}`,
  });
}
```

**Actions:**
1. Integrate goal progress recording into workout completion flow (**portal train** → Goals).
2. Match goals by exercise and type.
3. Update goal current value automatically.

**Optional (Goals → Portal train):** Add “Start today’s workout” or “View in Train” links on `/portal/goals` or goal detail → `/portal/train/log`, `/portal/train/overview`, etc.

**B. Sync (offline train → portal)**

**When:** User has used **`/train`** offline, then logs in and uses **`/portal/train`**.

**Actions:**
1. Define sync trigger (e.g. on login, or when opening `/portal/train`).
2. Upload local workout logs, plans, etc. from guest/local storage to API.
3. Handle conflicts (e.g. last-write-wins or merge strategy).
4. Optionally prompt user: “You have offline data. Sync now?”

---

## ✅ Checklist

- [ ] Step 1: Prisma schema created and migrated
- [ ] Step 2: TypeScript types defined
- [ ] Step 3: tRPC router implemented and added to root
- [ ] Step 4: Custom hooks (`useGoals`, `useGoal`, `useGoalMutations`) created
- [ ] Step 5: `GoalCard` component (View/Container/Types) implemented
- [ ] Step 6: `GoalProgress` component (View/Container/Types) implemented
- [ ] Step 6b: Goals under **`app/portal/goals/`** (portal layout); add Goals to portal nav
- [ ] Step 7: `/portal/goals` dashboard page created
- [ ] Step 8: `/portal/goals/new` create page created
- [ ] Step 9: `/portal/goals/[goalId]` detail page created
- [ ] Step 10: Portal train → Goals integration; optional sync (offline `/train` → `/portal/train`)

---

## 🎯 Next Steps After Goals

Once Goals is complete, move to:
1. **Coaching Content** (DOMS messages, sickness messages)
2. **Coaching UX** (`CoachMessage` component, `useCoaching` hook)
3. **Meals Feature** (follow same pattern as Goals)

---

**Remember:** Always follow the View/Container/Types pattern. Keep logic separate from UI. Use Context/Provider only when needed for shared state across routes.
