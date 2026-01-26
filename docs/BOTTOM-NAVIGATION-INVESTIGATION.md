# Bottom Navigation Investigation & Redesign Plan

## Current State Analysis

### Problem Statement
The bottom navigation system is mixing up **Portal Navigation** and **Train Navigation**, causing confusion when users navigate between portal and train contexts.

### Current Architecture

#### 1. **Navigation Components**

##### `MobileBottomNav` (Portal Navigation)
- **Location**: `src/components/mobile-bottom-nav.tsx`
- **Used in**: `src/app/portal/layout.tsx`
- **Routes**: All routes under `/portal/*`
- **Items**:
  - **Guest Mode**: Home, Train, History
  - **Authenticated**: AI, Templates, Goals, History
- **Z-index**: `z-50`
- **Visibility**: `md:hidden` (mobile only)

##### `TrainBottomNav` (Train Navigation)
- **Location**: `src/components/train/TrainBottomNav.tsx`
- **Used in**: `src/app/train/layout.tsx`
- **Routes**: All routes under `/train/*`
- **Items**: Home, Log (Resume/Idle/Rest), History, More
- **Z-index**: `z-50`
- **Visibility**: 
  - Mobile: `md:hidden` (full-width bar)
  - Desktop: `md:block` (floating dock at bottom)

#### 2. **Route Structure**

```
/portal/*                    → Portal Layout → MobileBottomNav
  ├── /portal/train/*        → Portal Layout → MobileBottomNav ❌ (WRONG!)
  │   ├── /portal/train/log
  │   ├── /portal/train/history
  │   ├── /portal/train/overview
  │   ├── /portal/train/templates
  │   └── ...
  ├── /portal/goals
  ├── /portal/ai-planner
  └── ...

/train/*                     → Train Layout → TrainBottomNav ✅ (CORRECT)
  ├── /train/log
  ├── /train/history
  ├── /train/overview
  └── ...
```

### Issues Identified

1. **Route Context Mismatch**
   - Routes under `/portal/train/*` are train-related but show portal navigation
   - Users expect train navigation when working with workouts
   - Creates confusion about which navigation context they're in

2. **No Visual Context Indicator**
   - No way to know if you're in "Portal" or "Train" mode
   - No visual cue for context switching

3. **No Smooth Transitions**
   - Navigation switches abruptly
   - No animation when transitioning between contexts

4. **Layout Conflicts**
   - Both navigations use `fixed bottom-0` positioning
   - Same z-index (`z-50`)
   - Potential overlap if both render simultaneously

### Current Navigation Items Comparison

| Portal Nav (Guest) | Portal Nav (Auth) | Train Nav |
|-------------------|-------------------|-----------|
| Home (`/portal`) | AI (`/portal/ai-planner`) | Home (`/train`) |
| Train (`/train`) | Templates (`/train/templates`) | Log (`/train/log`) |
| History (`/train/history`) | Goals (`/portal/goals`) | History (`/train/history`) |
| | History (`/train/history`) | More (menu) |

**Observations**:
- Both navigations link to `/train/history` (overlap)
- Portal nav links to `/train/templates` (cross-context)
- No clear separation of concerns

---

## Proposed Solution: Context-Aware Navigation with Slide Transitions

### Design Goals

1. **Context Detection**: Automatically detect if user is in "Portal" or "Train" context
2. **Smooth Transitions**: Slide animation when switching between contexts
3. **Visual Indicator**: Chevron/arrow indicator showing context and ability to switch
4. **Unified Experience**: Single navigation component that adapts to context

### Architecture Proposal

#### 1. **Context Detection Logic**

```typescript
// Determine navigation context based on route
function getNavigationContext(pathname: string): "portal" | "train" {
  // Train routes (including portal/train/*)
  if (pathname.startsWith("/train") || pathname.startsWith("/portal/train")) {
    return "train";
  }
  // Portal routes
  if (pathname.startsWith("/portal")) {
    return "portal";
  }
  // Default to portal for root and other routes
  return "portal";
}
```

#### 2. **Unified Navigation Component**

Create a new `ContextAwareBottomNav` component that:
- Detects current context (portal vs train)
- Renders appropriate navigation items
- Handles smooth slide transitions
- Shows context indicator

#### 3. **Visual Design**

```
┌─────────────────────────────────────┐
│  [Portal Nav Items]          [→]   │  ← Portal Context
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  [Train Nav Items]           [←]   │  ← Train Context
└─────────────────────────────────────┘
```

**Features**:
- **Chevron Indicator**: 
  - `→` when in Portal (click to switch to Train)
  - `←` when in Train (click to switch to Portal)
- **Slide Animation**: Horizontal slide when switching contexts
- **Context Badge**: Optional small badge showing current context

#### 4. **Transition Flow**

**Scenario 1: Portal → Train**
1. User clicks Train item in Portal nav
2. Navigation slides left (Portal nav exits, Train nav enters)
3. Route changes to `/train/*` or `/portal/train/*`
4. Train navigation appears with `←` indicator

**Scenario 2: Train → Portal**
1. User clicks `←` indicator or Portal item
2. Navigation slides right (Train nav exits, Portal nav enters)
3. Route changes to `/portal/*`
4. Portal navigation appears with `→` indicator

**Scenario 3: Direct Navigation**
- If user directly navigates to `/portal/train/log`, automatically show Train nav
- If user directly navigates to `/portal/goals`, automatically show Portal nav

### Implementation Plan

#### Phase 1: Context Detection & Routing
- [ ] Create `useNavigationContext()` hook
- [ ] Update route detection logic
- [ ] Ensure `/portal/train/*` routes use train navigation

#### Phase 2: Unified Navigation Component
- [ ] Create `ContextAwareBottomNav` component
- [ ] Merge navigation items from both navs
- [ ] Implement context switching logic
- [ ] Add chevron indicator button

#### Phase 3: Slide Animations
- [ ] Implement horizontal slide transitions
- [ ] Use CSS transforms for smooth animation
- [ ] Add transition states (entering, exiting, stable)

#### Phase 4: Integration
- [ ] Replace `MobileBottomNav` in portal layout
- [ ] Replace `TrainBottomNav` in train layout
- [ ] Update route handlers to respect context
- [ ] Test all navigation flows

#### Phase 5: Polish
- [ ] Add context badge/indicator
- [ ] Improve animation timing
- [ ] Add haptic feedback (mobile)
- [ ] Accessibility improvements

### Technical Details

#### Component Structure

```typescript
// src/components/navigation/ContextAwareBottomNav.tsx

interface NavigationContext {
  type: "portal" | "train";
  items: NavItem[];
}

function ContextAwareBottomNav() {
  const pathname = usePathname();
  const context = getNavigationContext(pathname);
  const [transitionState, setTransitionState] = useState<"stable" | "sliding">("stable");
  
  // Navigation items based on context
  const portalItems = getPortalNavItems();
  const trainItems = getTrainNavItems();
  
  // Handle context switch
  const handleContextSwitch = () => {
    setTransitionState("sliding");
    // Navigate to opposite context
    if (context === "portal") {
      router.push("/train");
    } else {
      router.push("/portal");
    }
    // Reset transition after animation
    setTimeout(() => setTransitionState("stable"), 300);
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="relative overflow-hidden">
        {/* Portal Nav - slides in/out */}
        <div className={cn(
          "absolute inset-0 transition-transform duration-300",
          context === "portal" ? "translate-x-0" : "-translate-x-full"
        )}>
          <PortalNavItems items={portalItems} />
          <ContextSwitchButton 
            direction="right" 
            onClick={handleContextSwitch}
          />
        </div>
        
        {/* Train Nav - slides in/out */}
        <div className={cn(
          "absolute inset-0 transition-transform duration-300",
          context === "train" ? "translate-x-0" : "translate-x-full"
        )}>
          <TrainNavItems items={trainItems} />
          <ContextSwitchButton 
            direction="left" 
            onClick={handleContextSwitch}
          />
        </div>
      </div>
    </nav>
  );
}
```

#### Animation Strategy

```css
/* Slide transitions */
.nav-slide-enter {
  transform: translateX(100%);
}
.nav-slide-enter-active {
  transform: translateX(0);
  transition: transform 300ms ease-in-out;
}
.nav-slide-exit {
  transform: translateX(0);
}
.nav-slide-exit-active {
  transform: translateX(-100%);
  transition: transform 300ms ease-in-out;
}
```

### Route Mapping

#### Portal Context Routes
- `/portal` → Portal Home
- `/portal/goals` → Goals
- `/portal/ai-planner` → AI Planner
- `/portal/exercises` → Exercises
- `/portal/account` → Account
- `/portal/train/*` → **Should show Train Nav** (context switch)

#### Train Context Routes
- `/train` → Train Home
- `/train/log` → Workout Logger
- `/train/history` → Workout History
- `/train/overview` → Program Overview
- `/train/templates` → Templates
- `/portal/train/*` → **Should show Train Nav** (same context)

### Benefits

1. **Clear Context**: Users always know which navigation mode they're in
2. **Smooth UX**: Slide animations provide visual feedback
3. **Intuitive Switching**: Chevron indicator makes context switching obvious
4. **Unified Codebase**: Single navigation component instead of two
5. **Better Mobile UX**: Consistent navigation experience across contexts

### Potential Challenges

1. **Route Conflicts**: Some routes might exist in both contexts
   - **Solution**: Prioritize context-based routing, use redirects if needed

2. **Animation Performance**: Smooth animations on low-end devices
   - **Solution**: Use CSS transforms (GPU-accelerated), add `will-change` hints

3. **State Management**: Maintaining navigation state during transitions
   - **Solution**: Use React state + URL-based context detection

4. **Backward Compatibility**: Existing links might break
   - **Solution**: Add redirects from `/portal/train/*` to `/train/*` if needed

### Next Steps

1. **Review & Approval**: Get feedback on this design approach
2. **Prototype**: Build a simple prototype to test animations
3. **Implementation**: Start with Phase 1 (context detection)
4. **Testing**: Test all navigation flows thoroughly
5. **Iteration**: Refine based on user feedback

---

## Questions to Consider

1. Should `/portal/train/*` routes redirect to `/train/*` or stay as-is?
2. Should context switching be instant or require confirmation?
3. Should we maintain separate layouts or unify them?
4. How should desktop navigation work? (Currently Train has floating dock)
5. Should context be persisted in localStorage/sessionStorage?

---

## References

- Current Portal Nav: `src/components/mobile-bottom-nav.tsx`
- Current Train Nav: `src/components/train/TrainBottomNav.tsx`
- Portal Layout: `src/app/portal/layout.tsx`
- Train Layout: `src/app/train/layout.tsx`
