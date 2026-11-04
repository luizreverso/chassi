---
name: git-pr-workflow
description: Standardized workflow for running pre-PR domain and secret guards, committing changes with conventional commits, capturing E2E visual proofs, and creating structured GitHub Pull Requests targeting the default branch via gh CLI.
---

# Git Commit, Visual E2E & PR Workflow Skill

This skill defines the standard operating procedure for committing code, running domain/secret guards, capturing visual E2E evidence, and publishing high-quality Pull Requests with the GitHub CLI (`gh`).

---

## 1. Pre-Commit Guardrails & Commit Guidelines

1. **Run Secret & Domain Guards**:
   Before committing, verify zero plaintext secrets and zero domain/boundary drift:
   ```bash
   node scripts/scan-secrets.mjs
   node scripts/domain-guard.mjs
   ```
2. **Conventional Commit Format**:
   Always use standard conventional commit prefixes:
   - `feat(<scope>)`: New feature or user-facing capability.
   - `fix(<scope>)`: Bug fix or resolution of broken behavior.
   - `test(<scope>)`: Adding or updating unit / integration / E2E tests.
   - `style(<scope>)`: Visual layout, Tailwind, or CSS updates.
   - `refactor(<scope>)`: Internal refactoring without behavioral changes.
   - `chore(<scope>)`: Build, tooling, or workspace documentation updates.
3. **Commit Body**:
   Include concise summaries explaining *why* the change was made, which issue (`issues/NNN-*.md`) it resolves, and the empirical test evidence verifying it.

---

## 2. E2E Test Execution & Visual Proof Capture

Whenever UI or user flow changes are made:
1. **Run Automated Test Suite**:
   Execute the project's test and typecheck commands defined in `.agents/backbone.json` (`commands.typecheck` and `commands.test`).
2. **Stateless Visual Proofs via Playwright CLI**:
   To capture visual proof without context-heavy browser MCPs or full DOM dumps, execute stateless Playwright CLI screenshots directly from the shell:
   ```bash
   # Desktop viewport (1280x720)
   npx -y playwright screenshot --viewport-size="1280,720" http://localhost:3000/target-route ./proofs/desktop.png

   # Mobile viewport (375x667)
   npx -y playwright screenshot --viewport-size="375,667" http://localhost:3000/target-route ./proofs/mobile.png
   ```
3. **Deterministic UI Anti-Pattern Check (Impeccable Detect)**:
   For frontend/UI modifications, run the deterministic detector to catch common UI anti-patterns (missing focus indicators, contrast failures, unclipped overflows, tiny touch targets) before human handoff:
   ```bash
   npx -y impeccable detect
   ```
4. **Reference Visual Evidence**:
   Link the visual screenshots or recordings in `work/<YYYY-MM-DD>_<name>/qa.md` and in the **Visual Verification** section of the Pull Request body.

---

## 3. GitHub CLI (`gh`) PR Creation Protocol

Before creating a Pull Request:
1. **Verify Active GitHub Account**:
   ```bash
   gh auth status
   ```
2. **Target Default Branch**:
   Check `.agents/backbone.json` for the repository's default branch (`main` or `master`) and target it when opening the PR.
3. **Create Structured Pull Request**:
   ```bash
   gh pr create \
     --base <default-branch> \
     --title "feat(<domain>): concise summary" \
     --body "$(cat << 'EOF'
   ## Summary
   - Concise bullet list of delivered capabilities

   ## Epistemic Verification & Guards
   - [x] `node scripts/scan-secrets.mjs` passed (zero plaintext credentials)
   - [x] `node scripts/domain-guard.mjs --full` passed (zero boundary leaks)
   - [x] Automated tests and typechecks passed cleanly

   ## Visual Verification (if UI affected)
   - [Attached screenshot or video proof]

   ## Related Work
   - Closes `work/<YYYY-MM-DD>_<name>/`
   EOF
   )"
   ```
