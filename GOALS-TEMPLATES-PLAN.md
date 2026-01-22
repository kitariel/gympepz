# Goals Templates Plan

**Purpose:** Make goal creation effortless by presenting pre-built goal templates
**Problem:** Current goal creation is manual and cumbersome
**Solution:** Template-first approach - users pick from 20 curated goal templates

---

## Overview

When a user navigates to `/portal/goals`:
1. **No goals yet?** → Show template grid (20 templates) as the main view
2. **Has goals?** → Show active goals + "Add Goal" button that opens template picker

---

## Goal Template Categories

### Strength Goals (6 templates)
| Template | Target | Exercise | Unit |
|----------|--------|----------|------|
| Bench Press 225 | 225 | Bench Press | lbs |
| Bench Press 315 | 315 | Bench Press | lbs |
| Squat 315 | 315 | Squat | lbs |
| Squat 405 | 405 | Squat | lbs |
| Deadlift 405 | 405 | Deadlift | lbs |
| Deadlift 500 | 500 | Deadlift | lbs |

### Rep Goals (4 templates)
| Template | Target | Exercise | Unit |
|----------|--------|----------|------|
| 20 Pull-ups | 20 | Pull-up | reps |
| 50 Push-ups | 50 | Push-up | reps |
| 10 Muscle-ups | 10 | Muscle-up | reps |
| 100 Bodyweight Squats | 100 | Bodyweight Squat | reps |

### Consistency Goals (5 templates)
| Template | Target | Timeframe | Unit |
|----------|--------|-----------|------|
| Gym Rat (30 workouts) | 30 | 3 months | workouts |
| Dedicated (50 workouts) | 50 | 6 months | workouts |
| Iron Will (100 workouts) | 100 | 1 year | workouts |
| Weekly Warrior (4x/week) | 16 | 1 month | workouts |
| Never Miss Monday | 12 | 3 months | workouts |

### Bodyweight Goals (5 templates)
| Template | Target | Direction | Unit |
|----------|--------|-----------|------|
| Lose 10 lbs | -10 | decrease | lbs |
| Lose 20 lbs | -20 | decrease | lbs |
| Gain 10 lbs | +10 | increase | lbs |
| Reach 180 lbs | 180 | target | lbs |
| Reach 200 lbs | 200 | target | lbs |

---

## UI Flow

### Step 1: Goals Dashboard (`/portal/goals`)

```
┌─────────────────────────────────────────────────────────────┐
│  Goals                                        [+ Add Goal]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 🏋️ Bench    │  │ 🔥 50       │  │ ⚡ Gym Rat  │        │
│  │ Press 225   │  │ Push-ups    │  │ 30 workouts │        │
│  │             │  │             │  │             │        │
│  │ ████████░░  │  │ ██████░░░░  │  │ ████░░░░░░  │        │
│  │ 185/225 lbs │  │ 35/50 reps  │  │ 12/30       │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ── Completed ──────────────────────────────────           │
│  ┌─────────────┐                                           │
│  │ ✓ 20 Pullups│                                           │
│  │ Completed   │                                           │
│  └─────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

### Step 2: Template Picker (Modal or New Page)

```
┌─────────────────────────────────────────────────────────────┐
│  Choose a Goal                                    [✕ Close] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Strength                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Bench    │ │ Bench    │ │ Squat    │ │ Squat    │      │
│  │ 225 lbs  │ │ 315 lbs  │ │ 315 lbs  │ │ 405 lbs  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  Reps                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 20       │ │ 50       │ │ 10       │ │ 100      │      │
│  │ Pull-ups │ │ Push-ups │ │ Muscle-up│ │ BW Squat │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  Consistency                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ Gym Rat  │ │ Dedicated│ │ Iron Will│                   │
│  │ 30 wrkts │ │ 50 wrkts │ │ 100 wrkts│                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│                                                             │
│  ──────────────────────────────────────────────────────    │
│  [Create Custom Goal →]                                     │
└─────────────────────────────────────────────────────────────┘
```

### Step 3: Confirm & Customize (Optional)

After selecting a template:

```
┌─────────────────────────────────────────────────────────────┐
│  Bench Press 225                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Target Weight                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 225                                             lbs │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Current Best (optional)                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 185                                             lbs │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Deadline (optional)                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 3 months from now                              📅  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Start This Goal]                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Structure

### Goal Template (Static/Seed Data)

```typescript
interface GoalTemplate {
  id: string;                    // "bench-225", "gym-rat-30"
  name: string;                  // "Bench Press 225"
  description: string;           // "Hit a 225lb bench press"
  category: "strength" | "reps" | "consistency" | "bodyweight";
  icon: string;                  // "dumbbell", "flame", "target", "scale"

  // Pre-filled values
  type: GoalType;                // "strength" | "reps" | "consistency" | "bodyweight"
  exerciseSlug?: string;         // "bench-press" (to lookup exerciseId)
  targetValue: number;           // 225
  unit: string;                  // "lbs" | "kg" | "reps" | "workouts"
  suggestedDeadlineDays?: number; // 90 (3 months)
}
```

### Template Storage Options

**Option A: Hardcoded in code** (Recommended for MVP)
- Simple, no DB migration needed
- Templates defined in `src/lib/goal-templates.ts`
- Easy to add/modify

**Option B: Database seeded**
- More flexible
- Can be admin-managed later
- Requires migration

---

## Implementation Phases

### Phase 1: Template Data & UI
- [ ] Create `src/lib/goal-templates.ts` with 20 templates
- [ ] Create `GoalTemplatePicker` component (grid view)
- [ ] Create `GoalTemplateCard` component
- [ ] Update `/portal/goals/page.tsx` to show templates for new users

### Phase 2: Template Selection Flow
- [ ] Create `GoalTemplateConfirm` component (customize before saving)
- [ ] Wire up template → goal creation (map exerciseSlug to exerciseId)
- [ ] Add "Start This Goal" mutation

### Phase 3: Polish
- [ ] Add category filtering/tabs
- [ ] Add search (optional)
- [ ] Add "Custom Goal" escape hatch link
- [ ] Celebrate on goal creation (confetti? toast?)

---

## File Structure

```
src/
├── lib/
│   └── goal-templates.ts           # 20 template definitions
│
├── features/goals/components/
│   ├── GoalTemplatePicker/
│   │   ├── GoalTemplatePicker.view.tsx
│   │   ├── GoalTemplatePicker.container.tsx
│   │   ├── GoalTemplatePicker.types.ts
│   │   └── index.ts
│   │
│   ├── GoalTemplateCard/
│   │   ├── GoalTemplateCard.view.tsx
│   │   ├── GoalTemplateCard.types.ts
│   │   └── index.ts
│   │
│   └── GoalTemplateConfirm/
│       ├── GoalTemplateConfirm.view.tsx
│       ├── GoalTemplateConfirm.container.tsx
│       ├── GoalTemplateConfirm.types.ts
│       └── index.ts
│
└── app/portal/goals/
    ├── page.tsx                    # Shows templates or active goals
    └── new/
        └── page.tsx                # Keep for custom goal (fallback)
```

---

## Questions to Clarify

1. **Modal vs Page?** - Should template picker be a modal overlay or a separate route (`/portal/goals/new`)?
2. **Customization required?** - Can user just tap template and immediately create, or always show confirm screen?
3. **Unit preference?** - Should templates auto-detect user's unit preference (lbs vs kg)?
4. **Exercise matching?** - What if exercise doesn't exist in user's DB? (Create it? Show error?)

---

## Success Criteria

- [ ] User can create a goal in 2 taps (select template → confirm)
- [ ] Empty state shows templates, not a blank page
- [ ] Templates cover common fitness goals
- [ ] Custom goal creation still accessible
- [ ] Mobile-friendly grid layout

---

**Next Step:** Review this plan, answer clarifying questions, then implement Phase 1.
