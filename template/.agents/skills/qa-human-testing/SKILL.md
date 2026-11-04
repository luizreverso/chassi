---
name: qa-human-testing
description: Generate comprehensive human testing documentation (qa.md) with visual E2E proofs and UI anti-pattern checks for manual QA verification of a feature, bug fix, or PR.
---

# QA & Human Testing Documentation

This skill defines **Step 5** of the development workflow.

## Purpose
Before a pull request is merged, a human tester or product owner must be able to thoroughly verify the behavior without reading the code or guessing test scenarios. This skill analyzes the requirements, PRD, and git diff, and generates a structured, end-to-end testing guide at `work/<YYYY-MM-DD>_<name_of_the_work>/qa.md`.

## Procedure

### 1. Analyze Context
1. Read `work/<YYYY-MM-DD>_<name_of_the_work>/prd.md` and all completed issue files in `issues/`.
2. Review the actual code changes using `git diff --stat` against the default branch and inspect modified routes, components, and services.
3. Identify all user personas involved.

### 2. Generate `qa.md`
Write `work/<YYYY-MM-DD>_<name_of_the_work>/qa.md` using the template below.

<qa-template>
# QA Testing Guide: <Feature / Work Title>

**Date:** <YYYY-MM-DD>  
**Work Folder:** `<path-to-work-folder>`  
**Associated PR:** `<PR URL or branch name>`  

## 1. Prerequisites & Environment Setup
- **Environment**: (e.g. Local dev server, Staging URL, or Production URL)
- **Required Accounts / Personas**: Specific user roles or test credentials required.
- **Environment Variables / Feature Flags**: Required configuration flags.
- **Seed Data / State Preparation**: Specific entities that must exist in the database before starting.

## 2. Happy Path Scenarios
For each primary user story:

### Scenario 1: <User Story or Primary Action>
1. **Navigate to**: `<URL or starting screen>`
2. **Action**: Click/Enter `<exact action>`
3. **Inputs**:
   - Field A: `"test value"`
   - Field B: `"..."`
4. **Expected UI Outcome**: Describe observable screen state, success toasts, banners, or redirects.
5. **Expected API & Data Side Effects**:
   - HTTP status & endpoint called
   - Database record created/updated
   - External services triggered

## 3. Negative & Edge Case Scenarios

### Scenario 2: Validation & Error Handling
- Attempt action with empty required fields -> Expect inline validation errors.
- Attempt duplicate unique values -> Expect HTTP 409 Conflict handling.
- Attempt submission with network disconnected / offline -> Expect graceful failure message.

### Scenario 3: Permissions & Authentication
- Attempt access as an unauthenticated user -> Expect redirect to login / 401.
- Attempt access with insufficient permissions -> Expect 403 Forbidden handling.

## 4. Automated Visual Proofs & Screen Recordings
- **E2E Visual Execution**: Attach or link any Playwright / E2E video recordings, screenshots, or animated GIFs demonstrating happy-path execution.
  - Capture rapid stateless screenshots via:
    ```bash
    npx -y playwright screenshot --viewport-size="1280,720" http://localhost:3000/target ./proofs/desktop.png
    npx -y playwright screenshot --viewport-size="375,667" http://localhost:3000/target ./proofs/mobile.png
    ```
- **Deterministic UI Anti-Pattern Check (Impeccable Detect)**:
  For frontend/UI modifications, run the deterministic detector to catch common UI anti-patterns (missing focus indicators, contrast failures, unclipped overflows, tiny touch targets) before human handoff:
  ```bash
  npx -y impeccable detect
  ```
- **Attached Artifacts**: Embed or link the recorded happy path execution GIF/video, screenshots, and detector output so the human tester can preview screen state and animation behavior before testing.

## 5. Cross-Device & Responsive Checks (if frontend affected)
- [ ] Desktop viewport (>= 1280px)
- [ ] Tablet viewport (768px - 1024px)
- [ ] Mobile viewport (375px - 414px)

## 6. Human QA Sign-Off Checklist

- [ ] Happy paths verified
- [ ] Validation and edge cases verified
- [ ] No regression in adjacent screens or shared components
- [ ] Clean console / logs (no uncaught exceptions)
- [ ] QA Approved by: `__________________` Date: `__________`
</qa-template>

### 3. Review with User
Present a summary of the generated `qa.md` to the user and confirm whether any domain-specific scenarios or test accounts need to be added.
