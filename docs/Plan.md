# 🗂️ Plan

The **Plan** route is the core planning module of the MVP.  
It allows users to create, organize, and manage their weekly workout structure before executing workouts.

This route answers one main question:
> “What is my workout plan for the week?”

---

## 1. Workout Plan Overview

### Description
The Workout Plan page displays all user-created workout plans in a **card grid layout**, serving as the main entry point for plan management.

Each plan card provides a **mini dashboard summary** to give users instant context.

### Mini Dashboard Metrics
Each plan card shows:
- **Total Plans** – total number of workout plans created by the user
- **Active Plan** – indicates which plan is currently active
- **Total Days** – number of workout days (out of 7) with assigned workouts

### Purpose
- Gives users clarity at a glance
- Reduces cognitive load
- Encourages plan activation

---

## 2. Active Plan Concept

### Description
Only **one workout plan can be marked as Active** at any given time.

The **Active Plan** represents the user’s current weekly training structure and is used by:
- Workout execution
- Logging
- Progress tracking
- AI recommendations (future phase)

### Rules
- When a new plan is set as Active, the previously active plan is automatically deactivated
- Users can manually change the active plan at any time

### Why Active Plan Is Required
The Active Plan ensures:
- A single source of truth for daily workouts
- Clean habit loop integration
- Simplified workout execution flow

---

## 3. Weekly Structure (7-Day Framework)

### Description
Each workout plan is structured as a **7-day weekly layout** (Monday–Sunday).

By default:
- All 7 days exist
- No workouts are assigned initially
- Each day can later be marked as:
  - Workout Day
  - Rest Day

### Purpose
- Mirrors real-world weekly training schedules
- Prevents overplanning
- Encourages intentional rest days

---

## 4. Creating a Daily Workout

### Description
Users can create a workout for any day of the week.

Each daily workout includes:
- **Workout Name** (e.g., Push Day, Pull Day, Leg Day)
- A list of selected exercises

### Exercise Selection
- Exercises are selected from the existing **Exercise Library**
- Each exercise includes:
  - Sets
  - Reps

### Rules
- A day can have only one workout
- Rest days cannot contain exercises

---

## 5. Exercise Management Within a Day

### Description
Each workout day can contain **unlimited exercises**.

### Capabilities
- Add exercises from the Exercise Library
- Input:
  - Number of sets
  - Number of reps
- Reorder exercises via drag-and-drop
- Define exercise sequence for gym execution

### Purpose
- Allows personalized workout flow
- Matches real gym behavior
- Reduces friction during workout sessions

---

## 6. Day-to-Day Workout Reordering

### Description
Users can reorganize their weekly workouts dynamically.

### Supported Actions

#### Swap Workouts
- If **Day A** and **Day B** both have workouts:
  - Users can swap them

#### Transfer Workout
- If **Day A** has a workout and **Day B** is empty:
  - Users can transfer the workout

#### Rest Day Interaction
- If a day is marked as a Rest Day:
  - It can be swapped with a workout day
  - Rest Day status moves accordingly

### Purpose
- Supports real-life schedule changes
- Prevents users from deleting and recreating workouts unnecessarily

---

## 7. MVP Enhancements (Plan Route Only)

> These enhancements improve UX without expanding MVP scope.

### 7.1 Visual Day States
- Workout Day → highlighted
- Rest Day → muted
- Empty Day → neutral

---

### 7.2 Active Plan Indicator
- Clear visual badge on the active plan card
- Prevents user confusion

---

### 7.3 Duplicate Plan (Optional MVP+)
- Allows users to clone an existing plan
- Speeds up iteration and experimentation

---

### 7.4 Validation Rules
- Prevent activating a plan with no workouts
- Warn users if all 7 days are rest days

---

## 8. Out-of-Scope for This Route (Intentional)

The following are **not part of the Plan route MVP**:
- Workout logging
- Progress tracking
- AI plan generation
- PDF export
- Sharing plans

These will be handled in separate routes.

---

## Summary

The **Plan** route provides:
- Weekly workout structure
- Clear active plan logic
- Flexible workout organization
- A foundation for habit loop execution

This route is the **planning brain** of the MVP and directly supports future AI and logging features.
