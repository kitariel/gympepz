# Theme Polish Plan (Light + Dark)

**Goal:** Improve background, labels, text, borders, and layout rhythm across light/dark modes with consistent contrast and spacing.

---

## Scope (Priority Screens)
1. Train log (portal)
2. Goals dashboard
3. Templates list
4. Workout summary
5. Onboarding wizard

---

## Phase 1 — Audit & Issues
- Capture current inconsistencies: low-contrast labels, mixed border weights, uneven spacing.
- Note areas where cards blend into the background or inputs lack separation.

---

## Phase 2 — Token Refresh (`src/styles/globals.css`)
- Tune core tokens for both modes:
  - `--background`, `--card`, `--muted`
  - `--foreground`, `--muted-foreground`
  - `--border`, `--input`, `--ring`
- Add 1–2 layout utilities:
  - `.panel` (consistent surface with padding + border)
  - `.section-stack` (vertical rhythm)

---

## Phase 3 — Component Alignment
- Update core components to rely on tokens:
  - Card, Input, Badge, Button, separators
- Ensure label and secondary text contrast meets accessibility in both modes.

---

## Phase 4 — Layout Rhythm + Borders
- Normalize spacing and border weights on key screens.
- Confirm mobile-first layout density and tap targets remain usable.

---

## Phase 5 — QA Checklist
- Light + dark mode check:
  - Text contrast (primary + muted)
  - Card separation from background
  - Input borders visible
  - Focus ring visibility
  - Overall layout spacing consistency

