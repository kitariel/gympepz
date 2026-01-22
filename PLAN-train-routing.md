# Train Route Consolidation Plan

## Problem Statement

Currently, the train feature exists in two locations:
- `/train/*` - Standalone experience (outside portal)
- `/portal/train/*` - Portal-integrated experience

**Issues:**
1. **Inconsistent routing** - Links in `/portal/train/*` sometimes navigate to `/train/*` instead of staying within portal
2. **No design context awareness** - Components don't adapt their layout based on whether they're in portal or standalone
3. **No easy way to switch** - Users can't toggle between portal and standalone modes

---

## Proposed Solution

### 1. Route Context Detection

Create a hook to detect the current route context:

```tsx
// src/hooks/useRouteContext.ts
export type RouteContext = "portal" | "standalone";

export function useRouteContext(): RouteContext {
  const pathname = usePathname();
  return pathname.startsWith("/portal") ? "portal" : "standalone";
}
```

### 2. Route Path Builder

Create a utility to build correct paths based on context:

```tsx
// src/lib/routes.ts
export function trainPath(context: RouteContext, path: string = "") {
  const base = context === "portal" ? "/portal/train" : "/train";
  return path ? `${base}/${path}` : base;
}

// Usage examples:
// trainPath("portal", "log") → "/portal/train/log"
// trainPath("standalone", "templates") → "/train/templates"
```

### 3. Components to Update

| Component | File | Changes Needed |
|-----------|------|----------------|
| WorkoutLogger | `src/features/train/components/WorkoutLogger/` | Use `trainPath()` for all navigation |
| TrainOverview | `src/features/train/components/TrainOverview/` | Use `trainPath()` for all navigation |
| TemplateList | `src/features/train/components/TemplateList/` | Use `trainPath()` for all navigation |
| WorkoutHistory | `src/features/train/components/WorkoutHistory/` | Use `trainPath()` for all navigation |

### 4. Layout Differences

| Aspect | Portal (`/portal/train/*`) | Standalone (`/train/*`) |
|--------|---------------------------|-------------------------|
| Sidebar | App sidebar visible | No sidebar or minimal nav |
| Header | Portal header with user menu | Standalone header |
| Bottom nav | Portal bottom nav (mobile) | Train-specific bottom nav |
| Padding | Account for sidebar width | Full width |

### 5. Context Switcher Button

Add a toggle button to switch between modes:

**In Portal:**
```
[Open in Fullscreen] → navigates to /train/*
```

**In Standalone:**
```
[Back to Portal] → navigates to /portal/train/*
```

Location: Header area or floating action button

---

## Implementation Steps

### Phase 1: Foundation
- [ ] Create `useRouteContext` hook
- [ ] Create `trainPath` route builder utility
- [ ] Create `TrainLayoutContext` provider

### Phase 2: Fix Routing
- [ ] Audit all `router.push()` and `Link href` in train components
- [ ] Replace hardcoded paths with `trainPath()` calls
- [ ] Test all navigation flows in both contexts

### Phase 3: Layout Adaptation
- [ ] Create `TrainLayout` wrapper component
- [ ] Implement context-aware padding/margins
- [ ] Add context switcher button

### Phase 4: Testing
- [ ] Test `/train/log` → all links stay in `/train/*`
- [ ] Test `/portal/train/log` → all links stay in `/portal/train/*`
- [ ] Test context switcher navigation
- [ ] Test mobile bottom navigation

---

## Files to Create/Modify

### New Files
```
src/hooks/useRouteContext.ts
src/lib/routes.ts
src/features/train/components/TrainLayout/
  ├── index.ts
  ├── TrainLayout.tsx
  └── ContextSwitcher.tsx
```

### Files to Modify
```
src/features/train/components/WorkoutLogger/WorkoutLogger.container.tsx
src/features/train/components/TrainOverview/TrainOverview.container.tsx
src/app/train/layout.tsx
src/app/portal/train/layout.tsx
```

---

## Questions to Clarify

1. **Standalone mode purpose**: Is `/train/*` meant for unauthenticated users, or just a "focus mode" without portal chrome?

2. **Feature parity**: Should both modes have identical features, or should standalone be limited?

3. **Default behavior**: When a user logs in, should they be redirected to portal or standalone?

4. **Deep linking**: If someone shares a `/train/log` link, should authenticated users be redirected to `/portal/train/log`?

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking existing bookmarks | Keep both route structures, just fix internal navigation |
| Missing a hardcoded path | Grep for all `/train` strings before deployment |
| Context not propagating | Use React Context at layout level |

---

## Success Criteria

- [ ] All navigation within `/portal/train/*` stays in portal
- [ ] All navigation within `/train/*` stays standalone
- [ ] Context switcher works bidirectionally
- [ ] No 404s or routing loops
- [ ] Mobile navigation works correctly in both contexts
