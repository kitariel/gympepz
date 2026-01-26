# Prisma Schema (GymPepz)

This folder contains a **modular Prisma schema** split across multiple `*.prisma` files under `prisma/schema/`.

## Generator & datasource

- **Client generator**: `prisma-client-js`
- **Datasource**: PostgreSQL (`env("DATABASE_URL")`)

## Enums

### `UserStatus`

- `otp_sent`
- `not_active`
- `active`

## Models

### `User`

**Purpose**: Core user identity + auth state (OTP + credentials), plus app ownership/relations.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `@id @default(cuid())` |
| `email` | `String` | `@unique` |
| `name` | `String?` |  |
| `image` | `String?` |  |
| `emailVerified` | `DateTime?` |  |
| `passwordHash` | `String?` |  |
| `otpCodeHash` | `String?` |  |
| `otpExpiresAt` | `DateTime?` |  |
| `otpRequestedAt` | `DateTime?` |  |
| `otpVerifyAttempts` | `Int` | `@default(0)` |
| `otpVerifyLockUntil` | `DateTime?` |  |
| `status` | `UserStatus` | `@default(otp_sent)` |
| `failedLoginAttempts` | `Int` | `@default(0)` |
| `lockUntil` | `DateTime?` |  |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |
| `activePlanId` | `String?` | `@unique` (optional active plan pointer) |

**Relations**
- **1:1 (optional)** `location` → `UserLocation`
- **1:M** `accounts` → `Account[]`
- **1:M** `sessions` → `Session[]`
- **1:M** `images` → `UserImage[]`
- **1:M** `plans` → `Plan[]`
- **1:1 (optional)** `activePlan` → `Plan?` via relation `"UserActivePlan"` (`fields: [activePlanId]`)
- **1:M** `workoutLogs` → `WorkoutLog[]`
- **1:M** `progressEntries` → `ProgressEntry[]`
- **1:M** `prs` → `ExercisePR[]`
- **1:1 (optional)** `streak` → `WorkoutStreak?`
- **1:M** `pageViews` → `PageView[]`

---

### `Session`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `@id @default(cuid())` |
| `sessionToken` | `String` | `@unique` |
| `userId` | `String` |  |
| `expires` | `DateTime` |  |

**Relations**
- `user` → `User` (`onDelete: Cascade`)

---

### `VerificationToken`

| Field | Type | Notes |
| --- | --- | --- |
| `identifier` | `String` |  |
| `token` | `String` | `@unique` |
| `expires` | `DateTime` |  |

**Constraints**
- `@@unique([identifier, token])`

---

### `Account`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `@id @default(cuid())` |
| `userId` | `String` |  |
| `type` | `String` |  |
| `provider` | `String` |  |
| `providerAccountId` | `String` |  |
| `refresh_token` | `String?` | `@db.Text` |
| `access_token` | `String?` | `@db.Text` |
| `expires_at` | `Int?` |  |
| `token_type` | `String?` |  |
| `scope` | `String?` |  |
| `id_token` | `String?` | `@db.Text` |
| `session_state` | `String?` |  |

**Relations**
- `user` → `User` (`onDelete: Cascade`)

**Constraints**
- `@@unique([provider, providerAccountId])`

---

### `Exercise`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `@id @default(cuid())` |
| `name` | `String` |  |
| `muscleGroup` | `String` |  |
| `equipment` | `String?` |  |
| `category` | `String?` |  |
| `difficulty` | `String?` |  |
| `description` | `String?` |  |
| `howTo` | `String?` |  |
| `imageUrl` | `String?` |  |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

**Relations**
- **1:M** `planExercises` → `PlanExercise[]`
- **1:M** `workoutLogExercises` → `WorkoutLogExercise[]`
- **1:M** `workoutSets` → `WorkoutSet[]`
- **1:M** `prs` → `ExercisePR[]`

**Indexes**
- `@@index([muscleGroup, difficulty])`

---

### `Plan`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `@id @default(cuid())` |
| `userId` | `String` |  |
| `name` | `String` |  |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

**Relations**
- `user` → `User` (`onDelete: Cascade`)
- `activeForUser` → `User?` via relation `"UserActivePlan"`
- `days` → `PlanDay[]`

---

### `PlanDay`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `@id @default(cuid())` |
| `planId` | `String` |  |
| `title` | `String` |  |
| `order` | `Int` |  |
| `day` | `String?` | day-of-week label (e.g. `"Monday"`) |
| `isRestDay` | `Boolean` | `@default(false)` |

**Relations**
- `plan` → `Plan` (`onDelete: Cascade`)
- `items` → `PlanExercise[]`
- `workoutLogs` → `WorkoutLog[]`

---

### `PlanExercise`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `@id @default(cuid())` |
| `planDayId` | `String` |  |
| `exerciseId` | `String` |  |
| `sets` | `Int` |  |
| `reps` | `Int` |  |
| `weight` | `Float?` |  |
| `order` | `Int` | `@default(0)` (order within day) |

**Relations**
- `day` → `PlanDay` (`onDelete: Cascade`)
- `exercise` → `Exercise` (`onDelete: Restrict`)

**Indexes**
- `@@index([planDayId, order])`

---

### `WorkoutLog`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `@id @default(cuid())` |
| `userId` | `String` |  |
| `planDayId` | `String?` | optional link to planned day |
| `date` | `DateTime` | `@default(now())` |
| `startTime` | `DateTime` | `@default(now())` |
| `endTime` | `DateTime?` |  |
| `duration` | `Int?` | minutes |
| `notes` | `String?` |  |
| `completed` | `Boolean` | `@default(false)` |
| `totalVolume` | `Float?` | calculated kg lifted |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

**Relations**
- `user` → `User` (`onDelete: Cascade`)
- `planDay` → `PlanDay?` (`onDelete: SetNull`)
- `exercises` → `WorkoutLogExercise[]`
- `sets` → `WorkoutSet[]`
- `prs` → `ExercisePR[]`

**Indexes**
- `@@index([userId, date])`

---

### `WorkoutLogExercise`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `@id @default(cuid())` |
| `workoutLogId` | `String` |  |
| `exerciseId` | `String` |  |
| `sets` | `Int` |  |
| `reps` | `Int` |  |
| `weight` | `Float?` |  |
| `rpe` | `Int?` | 1–10 |
| `notes` | `String?` |  |
| `order` | `Int` | `@default(0)` |
| `createdAt` | `DateTime` | `@default(now())` |

**Relations**
- `workoutLog` → `WorkoutLog` (`onDelete: Cascade`)
- `exercise` → `Exercise` (`onDelete: Restrict`)

**Indexes**
- `@@index([workoutLogId, exerciseId])`
- `@@index([workoutLogId, order])`

---

### `WorkoutSet`

**Purpose**: granular set-by-set logging.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `@id @default(cuid())` |
| `workoutLogId` | `String` |  |
| `exerciseId` | `String` |  |
| `setNumber` | `Int` | 1,2,3… |
| `targetReps` | `Int?` | planned |
| `actualReps` | `Int` | performed |
| `targetWeight` | `Float?` | planned (kg) |
| `actualWeight` | `Float?` | performed (kg) |
| `rpe` | `Int?` | 1–10 |
| `completed` | `Boolean` | `@default(false)` |
| `restSeconds` | `Int?` | rest after set |
| `notes` | `String?` |  |
| `createdAt` | `DateTime` | `@default(now())` |

**Relations**
- `workoutLog` → `WorkoutLog` (`onDelete: Cascade`)
- `exercise` → `Exercise` (`onDelete: Restrict`)

**Indexes**
- `@@index([workoutLogId, exerciseId])`
- `@@index([workoutLogId, exerciseId, setNumber])`

---

### `ExercisePR`

**Purpose**: track personal records.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `@id @default(cuid())` |
| `userId` | `String` |  |
| `exerciseId` | `String` |  |
| `prType` | `String` | e.g. `"1RM"`, `"volume"`, `"reps"`, `"weight"` |
| `value` | `Float` |  |
| `reps` | `Int?` | context |
| `date` | `DateTime` |  |
| `workoutLogId` | `String?` | optional source log |
| `notes` | `String?` |  |
| `createdAt` | `DateTime` | `@default(now())` |

**Relations**
- `user` → `User` (`onDelete: Cascade`)
- `exercise` → `Exercise` (`onDelete: Cascade`)
- `workoutLog` → `WorkoutLog?` (`onDelete: SetNull`)

**Constraints / indexes**
- `@@unique([userId, exerciseId, prType])`
- `@@index([userId, exerciseId])`

---

### `WorkoutStreak`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `@id @default(cuid())` |
| `userId` | `String` | `@unique` |
| `currentStreak` | `Int` | `@default(0)` |
| `longestStreak` | `Int` | `@default(0)` |
| `lastWorkout` | `DateTime?` |  |
| `updatedAt` | `DateTime` | `@updatedAt` |

**Relations**
- `user` → `User` (`onDelete: Cascade`)

---

### `ProgressEntry`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `@id @default(cuid())` |
| `userId` | `String` |  |
| `date` | `DateTime` | `@default(now())` |
| `weight` | `Float?` | kg |
| `bodyFat` | `Float?` | % |
| `chest` | `Float?` | cm |
| `waist` | `Float?` | cm |
| `hips` | `Float?` | cm |
| `arms` | `Float?` | cm |
| `thighs` | `Float?` | cm |
| `neck` | `Float?` | cm |
| `shoulders` | `Float?` | cm |
| `notes` | `String?` |  |
| `imageUrl` | `String?` |  |
| `mood` | `String?` | e.g. `"great"`, `"good"`, `"tired"`, `"sore"` |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

**Relations**
- `user` → `User` (`onDelete: Cascade`)

**Indexes**
- `@@index([userId, date])`

---

### `PageView`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `@id @default(cuid())` |
| `path` | `String` |  |
| `userId` | `String?` |  |
| `userAgent` | `String?` |  |
| `createdAt` | `DateTime` | `@default(now())` |

**Relations**
- `user` → `User?`

**Indexes**
- `@@index([path])`
- `@@index([userId])`
- `@@index([createdAt])`

---

### `UserLocation`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `@id @default(cuid())` |
| `userId` | `String` | `@unique` |
| `country` | `String?` |  |
| `region` | `String?` |  |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

**Relations**
- `user` → `User` (`onDelete: Cascade`)

---

### `UserImage`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | `@id @default(cuid())` |
| `userId` | `String` |  |
| `url` | `String` |  |
| `title` | `String?` |  |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

**Relations**
- `user` → `User` (`onDelete: Cascade`)

