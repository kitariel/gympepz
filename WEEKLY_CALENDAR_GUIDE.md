# Weekly Calendar States Guide

## 📅 **7-Day Weekly Progress Tracker**

The weekly calendar shows **Monday through Sunday** with visual indicators for each day's status.

---

## 🎨 **Day States**

### **1. ✓ Workout Completed (Green)**
- **Color:** Teal to Emerald gradient
- **Icon:** Green checkmark ✓
- **Meaning:** You completed a workout on this day
- **Effect:** Glowing shadow, slightly scaled up
- **When:** Any past or today's completed workout

```
Example: Monday - You logged a workout ✓
```

---

### **2. ✗ Missed Workout (Red)**
- **Color:** Red
- **Icon:** Red X ✗
- **Meaning:** Past day with no workout logged
- **Effect:** Red shadow
- **When:** Any past day without activity

```
Example: Tuesday was yesterday, no workout ✗
```

---

### **3. ⭕ Today (White/Bordered)**
- **Color:** White (light mode) / Secondary (dark mode)
- **Border:** Teal border (2px)
- **Icon:** None (empty circle)
- **Meaning:** Current day
- **Effect:** Shadow, bordered
- **When:** The current day of the week

```
Example: Wednesday is today ⭕
```

---

### **4. ⚪ Future Day (Gray)**
- **Color:** Light gray / Secondary (muted)
- **Icon:** None (empty circle)
- **Meaning:** Upcoming day this week
- **Effect:** Subtle, minimal styling
- **When:** Any day that hasn't happened yet

```
Example: Thursday-Sunday haven't happened yet ⚪
```

---

### **5. ☕ Rest Day (Blue) - FUTURE FEATURE**
- **Color:** Blue gradient
- **Icon:** Coffee cup ☕
- **Meaning:** Planned recovery/rest day
- **Effect:** Blue shadow
- **When:** User marks a day as intentional rest
- **Status:** Not yet implemented (coming soon!)

```
Example: Sunday marked as rest day ☕
```

---

## 📊 **Visual Legend**

At the bottom of the calendar card, you'll see a legend:

```
🟢 Workout   🔴 Missed   ⭕ Today   ⚪ Future
```

---

## 🔄 **How It Works**

### **Week Start: Monday**
The calendar always shows the current week starting from Monday.

### **Real-Time Updates**
- Data fetches from `workoutLog.calendar` API
- Compares workout dates with calendar dates
- Updates immediately when workouts are completed

### **State Calculation**
```typescript
For each day (Mon-Sun):
  if (has workout logged) → Green ✓
  else if (past day && no workout) → Red ✗
  else if (is today) → White bordered ⭕
  else → Gray ⚪ (future)
```

---

## 🎯 **Example Week**

```
Mon  Tue  Wed  Thu  Fri  Sat  Sun
 ✓    ✗    ⭕    ⚪    ⚪    ⚪    ⚪
🟢   🔴   ⭕   ⚪   ⚪   ⚪   ⚪

Monday: Workout completed ✓
Tuesday: Missed (past, no workout) ✗
Wednesday: Today (no workout yet) ⭕
Thu-Sun: Future days ⚪
```

---

## 💪 **Workout Count**

The **flame icon** in the center shows:
- Number of **completed workouts** this week
- Only counts green checkmark days ✓
- Updates in real-time

```
🔥
3   ← 3 workouts this week
day streak this week!
```

---

## 🏆 **Longest Streak**

Below the calendar:
- Shows your **all-time best** consecutive workout days
- Separate from weekly count
- Motivational benchmark

```
22
Longest Streak
```

---

## 💬 **Motivational Messages**

Dynamic messages based on weekly performance:

| Workouts | Message |
|----------|---------|
| **5-7 days** | "You are on fire! Keep using the app to gain more streaks!" |
| **3-4 days** | "Great progress! Keep the momentum going 🔥" |
| **1-2 days** | "Good start! Try to work out at least 3-4 times this week" |
| **0 days** | "Start your first workout to begin your streak!" |

---

## 🖱️ **Interactive Features**

### **Hover Effects:**
- **Green days:** Scale up slightly
- **Red days:** Scale up slightly
- **Today:** Border brightens
- **Future days:** No interaction

### **Tooltips:**
Hover over any day to see:
- Day name
- Status (Completed/Missed/Today/Upcoming)

```
Example: Hover over Monday
→ "Mon: Workout completed ✓"
```

---

## 📱 **Responsive Design**

- **Grid:** 7 equal columns
- **Circle Size:** 44px (11 × 11)
- **Spacing:** 2 between circles
- **Mobile:** Scales down proportionally
- **Touch-friendly:** Large tap targets

---

## 🔮 **Future Enhancements**

### **Rest Day Marking (Coming Soon)**
Users will be able to:
1. Click on a future day
2. Mark it as "Rest Day"
3. See blue coffee icon ☕
4. Won't count as "missed"
5. Part of planned training

### **Click to View Details**
- Click any completed day
- See workout details
- Exercises performed
- Sets, reps, weight

### **Drag to Mark Multiple Days**
- Swipe across days
- Quick mark as rest
- Bulk planning

---

## 🎨 **Color Palette**

```css
Workout:  Teal (#14b8a6) to Emerald (#10b981)
Missed:   Red (#ef4444)
Today:    Border Teal (#14b8a6)
Future:   Gray (#e5e7eb) / Secondary
Rest:     Blue (#3b82f6) to Blue (#2563eb)
```

---

## 🧪 **Testing States**

### **To See All States:**

1. **Green ✓** - Complete a workout today
2. **Red ✗** - Have past days with no workouts
3. **Today ⭕** - Current day (automatic)
4. **Future ⚪** - Days after today (automatic)
5. **Rest ☕** - Not yet available

### **Example Scenarios:**

**New User (No Workouts):**
```
Mon  Tue  Wed  Thu  Fri  Sat  Sun
 ✗    ✗    ⭕    ⚪    ⚪    ⚪    ⚪
Past days are red, today is bordered, future is gray
```

**Active User (3 Workouts):**
```
Mon  Tue  Wed  Thu  Fri  Sat  Sun
 ✓    ✗    ✓    ⭕    ⚪    ⚪    ⚪
2 completed, 1 missed, today, 3 future
```

**Perfect Week:**
```
Mon  Tue  Wed  Thu  Fri  Sat  Sun
 ✓    ✓    ✓    ✓    ✓    ✓    ✓
All 7 days completed! 🔥
```

---

## 📊 **Data Flow**

```
1. profile-sidebar.tsx fetches:
   - workoutLog.calendar (all workouts this month)
   
2. Calculates thisWeekProgress:
   - Gets current week (Mon-Sun)
   - Checks each day for workouts
   - Determines state (completed/missed/today/future)
   
3. Passes to WeeklyStreakCard:
   - weekProgress: Array of 7 day objects
   - longestStreak: Number
   
4. Component renders:
   - Maps over 7 days
   - Applies correct styling
   - Shows appropriate icon
   - Adds interactivity
```

---

## 🎯 **Best Practices**

### **For Users:**
1. Check daily to stay motivated
2. Try to avoid red X's
3. Aim for 3-5 green checkmarks per week
4. Use as accountability tool

### **For Developers:**
1. Component is pure (no side effects)
2. State comes from parent
3. Conditional rendering based on props
4. Accessible with tooltips
5. Responsive by default

---

## 🔧 **Technical Details**

### **Component Props:**
```typescript
interface DayProgress {
  day: string;           // "Mon", "Tue", etc.
  hasWorkout: boolean;   // Workout completed
  isPast: boolean;       // Day is in the past
  isToday: boolean;      // Day is today
  isMissed: boolean;     // Past day, no workout
  isRestDay?: boolean;   // Future: Planned rest
}

interface WeeklyStreakCardProps {
  weekProgress: DayProgress[]; // Array of 7 days
  longestStreak: number;        // All-time best
}
```

### **CSS Classes:**
- Uses Tailwind CSS
- Gradients for visual appeal
- Shadows for depth
- Transitions for smoothness
- Responsive utilities

---

## 🎉 **Result**

The weekly calendar provides:
- ✅ **Clear visual feedback** (7 distinct day states)
- ✅ **Motivational design** (flame icon, streaks)
- ✅ **Real-time updates** (syncs with workouts)
- ✅ **Interactive** (hover effects, tooltips)
- ✅ **Professional** (legend, gradients, shadows)
- ✅ **Scalable** (ready for rest day feature)

**Your weekly progress at a glance! 📅💪**
