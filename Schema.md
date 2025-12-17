
1. Add Missing Models for Complete Feature Set

// Workout Logging
model WorkoutLog {
  id          String   @id @default(cuid())
  userId      String
  planDayId   String?  // Optional: links to a plan day
  date        DateTime @default(now())
  duration    Int?     // in minutes
  notes       String?
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user      User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  planDay   PlanDay?           @relation(fields: [planDayId], references: [id], onDelete: SetNull)
  exercises WorkoutLogExercise[]
}

model WorkoutLogExercise {
  id            String   @id @default(cuid())
  workoutLogId  String
  exerciseId    String
  sets          Int
  reps          Int
  weight        Float?
  rpe           Int?     // Rate of Perceived Exertion (1-10)
  notes         String?
  createdAt     DateTime @default(now())

  workoutLog WorkoutLog @relation(fields: [workoutLogId], references: [id], onDelete: Cascade)
  exercise   Exercise   @relation(fields: [exerciseId], references: [id], onDelete: Restrict)
}

// Progress Tracking
model ProgressEntry {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime @default(now())
  weight    Float?   // body weight in kg
  bodyFat   Float?   // percentage
  chest     Float?   // measurements in cm
  waist     Float?
  hips      Float?
  arms      Float?
  thighs    Float?
  notes     String?
  imageUrl  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
}

// AI Chat History for Workout Creation
model WorkoutChat {
  id        String   @id @default(cuid())
  userId    String
  messages  Json     // Array of {role: 'user'|'assistant', content: string}
  planId    String?  // If chat resulted in a plan
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan Plan? @relation(fields: [planId], references: [id], onDelete: SetNull)

  @@index([userId])
}

// AI Coach Interactions
model CoachChat {
  id        String   @id @default(cuid())
  userId    String
  topic     String   // 'weekly_adjustment', 'general_question', etc.
  messages  Json     // Array of {role: 'user'|'assistant', content: string}
  resolved  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, topic])
}

// Meal Planning
model MealPlan {
  id          String   @id @default(cuid())
  userId      String
  name        String
  startDate   DateTime
  endDate     DateTime
  targetCalories Int
  targetProtein  Float?
  targetCarbs    Float?
  targetFat      Float?
  isActive    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  meals MealPlanDay[]
}

model MealPlanDay {
  id         String   @id @default(cuid())
  mealPlanId String
  dayOfWeek  Int      // 0-6 (Sunday-Saturday)
  meals      Json     // Array of meal objects with nutritional info
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  mealPlan MealPlan @relation(fields: [mealPlanId], references: [id], onDelete: Cascade)
}

// Daily Nutrition Log
model NutritionLog {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime @default(now())
  calories  Int
  protein   Float
  carbs     Float
  fat       Float
  meals     Json     // Array of meal entries
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
}

// User Preferences & Profile
model UserProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  age               Int?
  gender            String?
  height            Float?   // in cm
  currentWeight     Float?   // in kg
  targetWeight      Float?
  activityLevel     String?  // sedentary, light, moderate, active, very_active
  fitnessGoal       String?  // lose_weight, gain_muscle, maintain, improve_endurance
  experienceLevel   String?  // beginner, intermediate, advanced
  workoutDaysPerWeek Int?
  preferredEquipment Json?   // Array of available equipment
  injuries          String?
  dietaryPreferences String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}



2. Update Existing Models with Relations

// Update User model to include new relations
model User {
    id                  String     @id @default(cuid())
    email               String     @unique
    name                String?
    image               String?
    emailVerified       DateTime?
    passwordHash        String?
    otpCodeHash         String?
    otpExpiresAt        DateTime?
    otpRequestedAt      DateTime?
    otpVerifyAttempts   Int        @default(0)
    otpVerifyLockUntil  DateTime?
    status              UserStatus @default(otp_sent)
    failedLoginAttempts Int        @default(0)
    lockUntil           DateTime?
    createdAt           DateTime   @default(now())
    updatedAt           DateTime   @updatedAt

    // Existing relations
    location     UserLocation?
    accounts     Account[]
    sessions     Session[]
    images       UserImage[]
    plans        Plan[]
    activePlanId String?       @unique
    activePlan   Plan?         @relation("UserActivePlan", fields: [activePlanId], references: [id])
    
    // New relations
    profile         UserProfile?
    workoutLogs     WorkoutLog[]
    progressEntries ProgressEntry[]
    workoutChats    WorkoutChat[]
    coachChats      CoachChat[]
    mealPlans       MealPlan[]
    nutritionLogs   NutritionLog[]
}

// Update Exercise model
model Exercise {
  id          String   @id @default(cuid())
  name        String
  muscleGroup String
  equipment   String?
  category    String?
  difficulty  String?
  description String?
  howTo       String?
  imageUrl    String?
  videoUrl    String?  // Add video demonstration
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  planExercises      PlanExercise[]
  workoutLogExercises WorkoutLogExercise[]
  
  @@index([muscleGroup, difficulty])
}

// Update Plan model
model Plan {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?  // Add description
  duration    Int?     // Plan duration in weeks
  difficulty  String?  // beginner, intermediate, advanced
  isPublic    Boolean  @default(false) // Share with community
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  activeForUser User?          @relation("UserActivePlan")
  days          PlanDay[]
  workoutChats  WorkoutChat[]
  
  @@index([userId])
}

// Update PlanDay model
model PlanDay {
  id          String  @id @default(cuid())
  planId      String
  title       String
  description String?  // e.g., "Chest & Triceps - Focus on compound movements"
  order       Int
  restDay     Boolean @default(false)  // Mark rest days

  plan        Plan           @relation(fields: [planId], references: [id], onDelete: Cascade)
  items       PlanExercise[]
  workoutLogs WorkoutLog[]
  
  @@unique([planId, order])
}





