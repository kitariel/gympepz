# Goals Feature – Quick Reference & Backup Guide

**Purpose:** Backup/quick reference for Goals implementation  
**Status:** Same as GOALS-IMPLEMENTATION.md, condensed for quick lookup

---

## 🔄 Plan Revision (Train Outside = Offline, Train + Goals Inside Portal = Synced)

- **`/train`** = **Offline train.** Standalone. Own layout. Local storage. No login.
- **`/portal/train`** = **Synced train.** Inside portal. Portal layout. API, DB. Use when logged in.
- **`/portal/goals`** = **Goals.** Inside portal only. Portal layout. Synced. No standalone `/goals`.
- **Sync:** Offline train data → server when user logs in / uses `/portal/train`.
- **Integration:** Portal train → Goals (`recordProgress`); Goals → Portal train (“Start workout” etc.).

---

## 🎯 Best Practices (Quick Reference)

### **1. Component Structure (ALWAYS)**
```
ComponentName/
├── ComponentName.tsx           # 🎨 VIEW (UI only)
├── ComponentName.container.tsx # 🧠 LOGIC (data, state, handlers)
├── ComponentName.types.ts      # 📝 Types
└── index.ts                    # 📦 Re-exports
```

### **2. View vs Container Rules**

| View Component | Container Component |
|----------------|---------------------|
| ✅ Receives props (view model) | ✅ All hooks (`useQuery`, `useMutation`) |
| ✅ Renders UI only | ✅ All API calls (tRPC) |
| ✅ No hooks (except local UI state) | ✅ Business logic |
| ✅ No API calls | ✅ Event handlers |
| ✅ Pure function | ✅ Transforms data → view model |

### **3. Context/Provider (When Needed)**
- ✅ Multiple components need same data
- ✅ Shared state across routes
- ❌ Don't use for simple props or single component state

---

## 📋 Quick Implementation Checklist

### **Phase 1: Database & Types**
- [ ] Create `prisma/schema/goal.prisma` (Goal + GoalProgress models)
- [ ] Add relations to User and Exercise models
- [ ] Run migration: `pnpm db:generate && pnpm db:push`
- [ ] Create `src/types/goal.types.ts` (Goal, GoalType, GoalStatus, etc.)

### **Phase 2: API Layer**
- [ ] Create `src/server/api/routers/goal.ts` (tRPC router)
- [ ] Add to `src/server/api/root.ts`: `goal: goalRouter`
- [ ] Implement: `getAll`, `getById`, `create`, `update`, `delete`, `getProgress`, `recordProgress`

### **Phase 3: Hooks**
- [ ] Create `src/hooks/useGoals.ts`
- [ ] Implement: `useGoals()`, `useGoal(goalId)`, `useGoalMutations()`

### **Phase 4: Components**
- [ ] Create `src/features/goals/components/GoalCard/` (View/Container/Types)
- [ ] Create `src/features/goals/components/GoalProgress/` (View/Container/Types)

### **Phase 5: Pages (under portal)**
- [ ] Create `src/app/portal/goals/page.tsx` (Dashboard) — uses **portal layout**
- [ ] Create `src/app/portal/goals/new/page.tsx` (Create form)
- [ ] Create `src/app/portal/goals/[goalId]/page.tsx` (Detail view)
- [ ] Add Goals to portal nav (sidebar / `MobileBottomNav`) → `/portal/goals`
- [ ] No separate Goals layout; Goals use **portal layout**

### **Phase 6: Integration + Sync**
- [ ] **Portal train → Goals:** Workout complete (`/portal/train/log`) → `recordProgress` for matching goals
- [ ] **Goals → Portal train:** Optional “Start workout” / “View in Train” → `/portal/train/log`
- [ ] **Sync (optional):** Offline `/train` data → server when user logs in / uses `/portal/train`

---

## 🗂️ File Structure Reference

```
prisma/schema/
└── goal.prisma                    # Goal + GoalProgress models

src/
├── types/
│   └── goal.types.ts              # Goal, GoalType, GoalStatus, GoalProgress
│
├── server/api/routers/
│   └── goal.ts                    # tRPC router (CRUD + progress)
│
├── hooks/
│   └── useGoals.ts                # useGoals(), useGoal(), useGoalMutations()
│
├── features/goals/components/
│   ├── GoalCard/
│   │   ├── GoalCard.types.ts
│   │   ├── GoalCard.container.tsx
│   │   ├── GoalCard.view.tsx
│   │   └── index.ts
│   └── GoalProgress/
│       ├── GoalProgress.types.ts
│       ├── GoalProgress.container.tsx
│       ├── GoalProgress.view.tsx
│       └── index.ts
│
└── app/portal/
    ├── layout.tsx                 # Portal layout (sidebar, header, nav)
    ├── goals/
    │   ├── page.tsx               # Dashboard (/portal/goals)
    │   ├── new/
    │   │   └── page.tsx           # Create (/portal/goals/new)
    │   └── [goalId]/
    │       └── page.tsx           # Detail (/portal/goals/[goalId])
    └── train/                     # (Optional) Train inside portal = /portal/train
```

---

## 🔑 Key Code Patterns

### **tRPC Router Pattern**
```typescript
export const goalRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await db.goal.findMany({
      where: { userId: ctx.session.user.id },
      include: { exercise: true },
    });
  }),
  // ... other procedures
});
```

### **Hook Pattern**
```typescript
export function useGoals() {
  const { data: goals } = api.goal.getAll.useQuery();
  // Transform/filter data
  return { goals, activeGoals, completedGoals };
}
```

### **Container Pattern**
```typescript
export function GoalCardContainer({ goal }: GoalCardProps) {
  const { progress } = useGoal(goal.id);
  const viewModel = useMemo(() => ({
    title: goal.exercise?.name,
    progress: progress?.percentage,
    // ... transform
  }), [goal, progress]);
  return <GoalCardView {...viewModel} />;
}
```

### **View Pattern**
```typescript
export function GoalCardView({ title, progress }: GoalCardViewModel) {
  return <Card>{/* Pure UI */}</Card>;
}
```

---

## 📊 Database Schema (Quick Reference)

```prisma
model Goal {
  id           String    @id @default(cuid())
  userId       String
  type         String    // "strength" | "reps" | "consistency" | "bodyweight"
  exerciseId   String?
  targetValue  Float
  currentValue Float     @default(0)
  unit         String    // "lbs" | "kg" | "reps" | "workouts"
  deadline     DateTime?
  status       String    @default("active") // "active" | "completed" | "abandoned"
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  completedAt  DateTime?

  user     User           @relation(fields: [userId], references: [id])
  exercise Exercise?      @relation(fields: [exerciseId], references: [id])
  progress GoalProgress[]

  @@index([userId, status])
}

model GoalProgress {
  id        String   @id @default(cuid())
  goalId    String
  value     Float
  date      DateTime @default(now())
  notes     String?
  createdAt DateTime @default(now())

  goal Goal @relation(fields: [goalId], references: [id])

  @@index([goalId, date])
}
```

---

## 🎯 Goal Types Reference

| Type | Description | Requires Exercise? | Unit Options |
|------|-------------|-------------------|--------------|
| `strength` | Lift X weight | ✅ Yes | `lbs`, `kg` |
| `reps` | Do X reps | ✅ Yes | `reps` |
| `consistency` | Complete X workouts | ❌ No | `workouts` |
| `bodyweight` | Reach X bodyweight | ❌ No | `lbs`, `kg` |

---

## 🔄 Integration Points

### **Workout Completion → Goal Progress**
```typescript
// After workout saved
const matchingGoals = activeGoals.filter(
  (goal) => goal.exerciseId === exercise.id && goal.type === "strength"
);

for (const goal of matchingGoals) {
  await recordProgress({
    goalId: goal.id,
    value: maxWeight, // From workout sets
  });
}
```

### **Goal Auto-Completion**
```typescript
// In recordProgress mutation
if (newValue >= targetValue) {
  status = "completed";
  completedAt = new Date();
}
```

---

## 🚨 Common Mistakes to Avoid

1. ❌ **Putting hooks in View component** → Move to Container
2. ❌ **API calls in View** → Move to Container
3. ❌ **Business logic in View** → Move to Container
4. ❌ **Missing types file** → Always create `.types.ts`
5. ❌ **Forgetting to invalidate queries** → Use `utils.goal.getAll.invalidate()` after mutations
6. ❌ **Not following View/Container pattern** → Always separate!

---

## 📝 Quick Commands

```bash
# Generate Prisma client
pnpm db:generate

# Push schema changes
pnpm db:push

# Create migration (if using migrations)
pnpm db:migrate dev

# Install date-fns (for date formatting)
pnpm add date-fns

# Install recharts (for progress charts - optional)
pnpm add recharts
```

---

## 🔗 Related Files to Check

- `src/features/train/components/HistoryList/` - Example View/Container pattern
- `src/features/train/components/WorkoutLogger/` - Example with mutations
- `src/server/api/routers/plan.ts` - Example tRPC router
- `src/hooks/useActiveProgram.ts` - Example custom hook
- `ARCHITECTURE-ALIGNMENT.md` - Full architecture comparison

---

## ✅ Final Checklist

Before marking Goals as complete:

- [ ] All routes work (`/train/goals`, `/train/goals/new`, `/train/goals/[goalId]`)
- [ ] GoalCard displays correctly with progress
- [ ] GoalProgress chart shows history
- [ ] Create goal form validates and saves
- [ ] Goals auto-complete when target reached
- [ ] Workout completion updates matching goals
- [ ] All components follow View/Container/Types pattern
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Tested on mobile and desktop

---

**Remember:** If you get stuck, refer to:
1. `GOALS-IMPLEMENTATION.md` - Full detailed guide
2. `ARCHITECTURE-ALIGNMENT.md` - Architecture comparison
3. Existing components in `src/features/train/components/` - Pattern examples

**Always follow:** View/Container/Types separation. Logic ≠ UI. Keep it clean! 🎯
