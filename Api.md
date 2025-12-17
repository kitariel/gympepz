// GET /api/nutrition/logs?date=2024-12-17
// Returns: NutritionLog

// POST /api/nutrition/logs
// Body: {
//   date: DateTime,
//   meals: Array<{
//     name: string,
//     time: string,
//     calories: number,
//     protein: number,
//     carbs: number,
//     fat: number,
//     items: string[]
//   }>,
//   notes?: string
// }
// Returns: Created NutritionLog

// GET /api/nutrition/goals
// Returns: Calculated calorie and macro goals based on user profile

// POST /api/nutrition/calculate-goals
// Body: {
//   goal: 'lose_weight' | 'gain_muscle' | 'maintain',
//   activityLevel: string,
//   targetWeightChangePerWeek?: number
// }
// Returns: { calories, protein, carbs, fat }
```

**Nutrition Tracking UI:**
```
Daily Log View
├── Progress Bar (calories consumed vs target)
├── Macro Breakdown Pie Chart
├── Meal Entries
│   ├── Meal Card
│   │   ├── Time & Name
│   │   ├── Quick Stats
│   │   ├── Food Items
│   │   └── Edit/Delete
│   └── Add Meal button
├── Water Intake Tracker
└── Daily Summary Card
```

**Integration with Meal Plan:**
- Quick-add meals from active meal plan
- Compare actual vs planned nutrition
- Suggest adjustments if off-target

---

## API Endpoints Structure (Complete Reference)

### Authentication
```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/verify-otp
POST   /api/auth/resend-otp
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/session
```

### User & Profile
```
GET    /api/user/profile
PUT    /api/user/profile
PUT    /api/user/profile/picture
DELETE /api/user/account
GET    /api/user/stats
```

### Dashboard
```
GET    /api/dashboard
GET    /api/dashboard/quick-stats
GET    /api/dashboard/recent-activity
```

### Exercises
```
GET    /api/exercises
GET    /api/exercises/:id
POST   /api/exercises/custom
PUT    /api/exercises/:id
DELETE /api/exercises/:id
POST   /api/exercises/:id/favorite
DELETE /api/exercises/:id/favorite
GET    /api/exercises/favorites
```

### Plans
```
GET    /api/plans
GET    /api/plans/:id
POST   /api/plans
PUT    /api/plans/:id
DELETE /api/plans/:id
POST   /api/plans/:id/activate
POST   /api/plans/:id/duplicate
```

### Plan Days
```
GET    /api/plans/:planId/days
GET    /api/plans/:planId/days/:dayId
POST   /api/plans/:planId/days
PUT    /api/plans/:planId/days/:dayId
DELETE /api/plans/:planId/days/:dayId
POST   /api/plans/:planId/days/reorder
```

### Plan Exercises
```
GET    /api/plan-days/:dayId/exercises
POST   /api/plan-days/:dayId/exercises
PUT    /api/plan-exercises/:id
DELETE /api/plan-exercises/:id
POST   /api/plan-exercises/reorder
```

### Workout Chat (AI)
```
POST   /api/workout/chat
GET    /api/workout/chats
GET    /api/workout/chats/:id
POST   /api/workout/generate-plan
DELETE /api/workout/chats/:id
```

### Workout Logs
```
GET    /api/workout-logs
GET    /api/workout-logs/:id
POST   /api/workout-logs
PUT    /api/workout-logs/:id
DELETE /api/workout-logs/:id
POST   /api/workout-logs/quick-start
POST   /api/workout-logs/:id/complete
GET    /api/workout-logs/calendar
GET    /api/workout-logs/streak
```

### Progress Tracking
```
GET    /api/progress
GET    /api/progress/:id
POST   /api/progress
PUT    /api/progress/:id
DELETE /api/progress/:id
GET    /api/progress/analytics
GET    /api/progress/charts
POST   /api/progress/upload-image
```

### Coach (AI)
```
POST   /api/coach/chat
GET    /api/coach/chats
GET    /api/coach/chats/:id
POST   /api/coach/weekly-adjustment
GET    /api/coach/weekly-adjustments
DELETE /api/coach/chats/:id
```

### Meal Plans
```
GET    /api/meal-plans
GET    /api/meal-plans/:id
POST   /api/meal-plans
PUT    /api/meal-plans/:id
DELETE /api/meal-plans/:id
POST   /api/meal-plans/:id/activate
POST   /api/meal-plans/generate
```

### Meal Plan Days
```
GET    /api/meal-plans/:planId/days
POST   /api/meal-plans/:planId/days
PUT    /api/meal-plans/:planId/days/:dayId
DELETE /api/meal-plans/:planId/days/:dayId
```

### Nutrition Logs
```
GET    /api/nutrition/logs
GET    /api/nutrition/logs/:id
POST   /api/nutrition/logs
PUT    /api/nutrition/logs/:id
DELETE /api/nutrition/logs/:id
GET    /api/nutrition/goals
POST   /api/nutrition/calculate-goals
GET    /api/nutrition/analytics
```

---

## Frontend Components Structure

### Recommended File Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── verify/
│   ├── (dashboard)/
│   │   ├── page.tsx (Dashboard)
│   │   ├── workout-creator/
│   │   │   ├── chat/
│   │   │   ├── plans/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── day/[dayId]/
│   │   │   └── exercises/
│   │   ├── logs/
│   │   │   ├── workouts/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   └── active/
│   │   │   └── progress/
│   │   ├── coach/
│   │   │   ├── chat/
│   │   │   └── weekly-adjustment/
│   │   └── nutrition/
│   │       ├── meal-plans/
│   │       └── tracking/
│   └── api/
│       └── (all API routes)
├── components/
│   ├── ui/ (shadcn components)
│   ├── dashboard/
│   ├── plans/
│   ├── exercises/
│   ├── workouts/
│   ├── progress/
│   ├── coach/
│   └── nutrition/
├── lib/
│   ├── db.ts (Prisma client)
│   ├── auth.ts
│   ├── ai.ts (AI API calls)
│   └── utils.ts
└── hooks/
    ├── useWorkoutTimer.ts
    ├── useWorkoutSession.ts
    └── useChartData.ts