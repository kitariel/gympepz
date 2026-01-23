# Calendar Preview Feature - Implementation Plan

## Overview
Add a Calendar preview tab to the TemplateDetails component that shows users how their workout schedule will look for the entire month before they commit to a program.

## User Flow
1. User views template details (current flow)
2. New "Calendar" tab appears alongside "Overview" tab
3. When Calendar tab is active, shows monthly calendar view
4. Calendar plots the weekly workout structure for the entire month
5. User can navigate between months
6. User can switch back to Overview tab to see weekly structure details
7. User clicks "Use this program" to commit

## Technical Design

### 1. Component Structure

#### Files to Modify:
- `src/features/train/components/TemplateDetails/TemplateDetails.view.tsx`
- `src/features/train/components/TemplateDetails/TemplateDetails.types.ts`
- `src/features/train/components/TemplateDetails/TemplateDetails.container.tsx` (minimal changes)

#### New Files to Create:
- `src/features/train/components/TemplateDetails/TemplateCalendarPreview.tsx` (new component)

### 2. UI Changes

#### TemplateDetails.view.tsx
- Wrap existing content in Tabs component
- Add two tabs: "Overview" (default) and "Calendar"
- Overview tab contains current weekly structure cards
- Calendar tab contains the new monthly calendar preview
- Keep "Use this program" and "Back" buttons outside tabs (always visible)

#### TemplateCalendarPreview.tsx (New Component)
- Uses Shadcn Calendar component (react-day-picker)
- Shows current month by default
- Allows month navigation (prev/next)
- Marks workout days with visual indicators
- Differentiates between workout days and rest days
- Shows day labels on hover/tooltip

### 3. Data Transformation Logic

#### Day Mapping
- Template uses `TemplateDayNumber` (1=Monday, 7=Sunday)
- JavaScript Date uses `getDay()` (0=Sunday, 1=Monday, ..., 6=Saturday)
- Conversion function: `getDayNumberForToday()` already exists in codebase

#### Calendar Projection Algorithm
For each day in the month:
1. Get the day of week (0-6, where 0=Sunday)
2. Convert to TemplateDayNumber (1-7, where 1=Monday, 7=Sunday)
3. Check if template has a workout scheduled for that day number
4. If yes, mark as workout day (show label, exercise count)
5. If no, mark as rest day (or unmarked)
6. Repeat for all days in the month

#### Implementation Details:
```typescript
// Pseudo-code
function projectTemplateToMonth(template: ProgramTemplate, month: Date): CalendarDay[] {
  const daysInMonth = getDaysInMonth(month);
  const templateDays = template.plan.days;
  
  return daysInMonth.map(date => {
    const dayOfWeek = date.getDay(); // 0-6
    const templateDayNumber = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert to 1-7
    const templateDay = templateDays.find(d => d.day === templateDayNumber);
    
    return {
      date,
      isWorkoutDay: !!templateDay && !templateDay.isRestDay && templateDay.items.length > 0,
      isRestDay: templateDay?.isRestDay ?? false,
      label: templateDay?.label,
      exerciseCount: templateDay?.items.length ?? 0,
    };
  });
}
```

### 4. Visual Design

#### Calendar Styling
- Use existing Shadcn Calendar component styling
- Workout days: Add colored dot/badge indicator
- Rest days: Subtle muted styling (if template explicitly marks rest days)
- Regular days (no workout): Default calendar styling
- Hover state: Show tooltip with day label and exercise count

#### Indicators
- **Workout days**: Primary color dot/badge, or highlighted cell background
- **Rest days**: Muted color, "R" indicator (if applicable)
- **Today**: Existing calendar "today" styling + workout indicator if applicable

### 5. State Management

#### TemplateDetails Container
- Add `activeTab` state: "overview" | "calendar"
- Pass tab state to view component
- No changes needed to template data fetching

#### TemplateCalendarPreview Component
- Local state for selected month (defaults to current month)
- Use `useState` for month navigation
- Use `date-fns` functions: `startOfMonth`, `endOfMonth`, `eachDayOfInterval`, `addMonths`, `subMonths`

### 6. Implementation Steps

#### Step 1: Update Types
- Add `activeTab` to `TemplateDetailsViewProps` (optional, defaults to "overview")
- Add calendar-related types if needed

#### Step 2: Create TemplateCalendarPreview Component
- Create new file: `TemplateCalendarPreview.tsx`
- Implement month navigation
- Implement day projection logic
- Style workout/rest day indicators
- Add tooltips for day details

#### Step 3: Update TemplateDetails.view.tsx
- Import Tabs components
- Wrap existing content in Tabs structure
- Add Calendar tab with TemplateCalendarPreview
- Keep action buttons outside tabs

#### Step 4: Update TemplateDetails.container.tsx
- Add tab state management (optional - can be local to view)
- Pass template data to calendar preview

#### Step 5: Testing
- Test with templates that have different day patterns (3-day, 4-day, 5-day)
- Test month navigation
- Test with templates that have rest days
- Test responsive design (mobile/desktop)

### 7. Code Structure

```
TemplateDetails/
├── TemplateDetails.container.tsx (minimal changes)
├── TemplateDetails.view.tsx (add tabs)
├── TemplateDetails.types.ts (add tab types)
└── TemplateCalendarPreview.tsx (new)
```

### 8. Dependencies
- ✅ `date-fns` (already installed v4.1.0)
- ✅ `react-day-picker` (via Shadcn Calendar)
- ✅ `@radix-ui/react-tabs` (via Shadcn Tabs)
- ✅ `lucide-react` (for icons if needed)

### 9. Edge Cases

1. **Sparse templates**: Templates with only 3 days/week (e.g., Mon, Wed, Fri)
   - Solution: Only mark those specific days, leave others unmarked

2. **Rest days**: Some templates explicitly mark rest days
   - Solution: Show rest day indicator if `isRestDay === true`

3. **Month boundaries**: Template repeats weekly, so it naturally wraps across months
   - Solution: Projection algorithm handles this automatically

4. **Empty templates**: Template with no days (shouldn't happen, but handle gracefully)
   - Solution: Show empty calendar with message

5. **Today's date**: Highlight today and show if it's a workout day
   - Solution: Use Calendar's built-in "today" modifier + custom workout indicator

### 10. Accessibility
- Ensure calendar is keyboard navigable (react-day-picker handles this)
- Add ARIA labels for workout/rest day indicators
- Ensure color contrast for indicators
- Screen reader announcements for day details

### 11. Performance
- Calendar projection is lightweight (O(n) where n = days in month)
- No API calls needed (all template data is local)
- Memoize month calculation if needed

## Implementation Checklist

- [ ] Create `TemplateCalendarPreview.tsx` component
- [ ] Implement day projection logic
- [ ] Add month navigation
- [ ] Style workout/rest day indicators
- [ ] Add tooltips for day details
- [ ] Update `TemplateDetails.types.ts` with tab types
- [ ] Update `TemplateDetails.view.tsx` with Tabs structure
- [ ] Update `TemplateDetails.container.tsx` if needed
- [ ] Test with various template patterns
- [ ] Test responsive design
- [ ] Verify accessibility
- [ ] Test month navigation edge cases

## Future Enhancements (Out of Scope)
- Allow users to select a start date for the program
- Show multiple months in a single view
- Allow users to customize which days to schedule workouts
- Show workout history overlay on calendar
