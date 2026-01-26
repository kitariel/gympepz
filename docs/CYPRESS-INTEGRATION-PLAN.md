# Cypress Integration Plan

Goal: add reliable E2E coverage with clear test data, guest mode support, and authenticated flows.

## Scope
- E2E tests only (no component testing initially).
- Cover guest mode and authenticated logging flows.
- Keep tests deterministic and isolated from production data.

## 1) Project Setup
- Install Cypress as a dev dependency.
- Add `cypress.config.ts` with baseUrl and screenshots/videos settings.
- Add npm scripts: `cypress:open`, `cypress:run`, `cypress:run:ci`.

## 2) Test Environment Strategy
- Use a dedicated test environment (separate DB or schema).
- Add `.env.cypress` for API keys, test user creds, and baseUrl.
- Provide a reset/seed script for deterministic data.

## 3) Auth + Guest Mode Coverage
- Guest mode:
  - Validate guest entry pages load.
  - Ensure guest actions are limited (e.g., cannot access protected routes).
- Authenticated mode:
  - Add a `cy.login()` command (UI-based or API/session-based).
  - Reuse session via `cy.session()` for speed.
  - Validate `/portal/train/log` and logging flow for a seeded user.

## 4) Core E2E Flows
- Guest flows:
  - `/portal/train` entry shows guest options.
  - Guest can start a workout and see expected UI state.
- Authenticated flows:
  - Login -> `/portal/train/overview`.
  - Start workout -> log sets -> finish workout -> summary.
- Exercises:
  - `/portal/exercises` loads and opens detail modal.
  - Video thumbnail renders when available.

## 5) Test Data Plan
- Seed exercises with:
  - `youtubeVideo` and `youtubeVideoIds`.
  - Mixed equipment/difficulty.
- Seed user with:
  - Active program, active day, and draft workout.
  - Pre-filled sets for logging scenarios.
- Add a reset endpoint or script run pre-test.

## 6) Reporting + Maintenance
- Add README section: how to run locally, how to update seeds.
- Define a flaky-test policy (retry once, tag, or quarantine).

## 7) Future: CI Integration
- Add a CI job to run Cypress in headless mode.
- Cache pnpm and Cypress binary to speed up runs.
- Upload screenshots/videos on failure.

## Deliverables
- `cypress.config.ts`, `cypress/` folder, and custom commands.
- Seed/reset scripts for test data.
- E2E specs covering guest mode and logging.

## Open Questions
- Preferred login strategy: UI login or API/session?
- Do we need test-user creation via API, or can we seed directly?
- CI target: GitHub Actions or another provider?
