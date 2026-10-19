---
name: work-workflow
description: Standard development process for starting and scoping new work, features, client requests, and tasks. Use whenever starting a new task, feature request, or project work item.
---

# Standard Development Workflow

This workflow standardizes how all new work, features, bug investigations, and client requests are captured, designed, executed, and verified. Project-specific boundaries, commands, and Dual-Guardian mappings are read from [`.agents/backbone.json`](file:///.agents/backbone.json).

## Workflow Steps

### Step 0: Project / Domain Bootstrap (When Needed)
If `.agents/backbone.json` has not been customized for this repository yet (or a new core bounded context is being introduced), run the [`bootstrap-guardians`](file:///.agents/skills/bootstrap-guardians/SKILL.md) skill first.

### Step 1: Work Directory & Requirements Capture
For every new work item:
1. Run `yarn work:new <name_of_the_work>` or activate the [`new-work`](file:///.agents/skills/new-work/SKILL.md) skill.
2. Creates `work/<YYYY-MM-DD>_<name_of_the_work>/` and initializes `requirements.md`.
3. Document:
   - What we want to build, or what the user/client requested.
   - Goals, constraints, and relevant context.

### Step 2: Grill-Me & PRD Generation
Before implementing or modifying code:
1. Activate the [`grill-me`](file:///.agents/skills/grill-me/SKILL.md) skill.
2. Relentlessly interview the user about every aspect of the plan or design until reaching shared understanding.
3. Walk down each branch of the decision tree, resolving dependencies between decisions one-by-one.
4. For each question, provide your recommended answer. Ask questions **one at a time**.
5. **Graphify & Codebase-first**: If a question can be answered by exploring the codebase or querying `graphify-out/GRAPH_REPORT.md` / `codebase-memory-mcp`, verify it directly (`[EXTRACTED]`) instead of asking the user.
6. Author `work/<YYYY-MM-DD>_<name>/prd.md` using the [`write-a-prd`](file:///.agents/skills/write-a-prd/SKILL.md) skill, including mandatory sign-off from the relevant **Domain Dual Guardians** (`ontology-*-guardian` $\times$ `business-*-guardian`) registered in [`.agents/backbone.json`](file:///.agents/backbone.json).

### Step 3: Tracer-Bullet Issue Slicing
1. Activate the [`prd-to-issues`](file:///.agents/skills/prd-to-issues/SKILL.md) skill to decompose the PRD into vertical, verifiable tracer bullet issues (`issues/NNN-*.md`).
2. Classify issues as `HITL` (human-in-the-loop review) or `AFK` (autonomous execution).
3. Quiz user on slice granularity, dependencies, and validation paths.

### Step 4: Test-Driven Implementation
1. Branch off the default branch with descriptive branch naming (`feat/<date>-<name>`).
2. Execute issues using the [`tdd`](file:///.agents/skills/tdd/SKILL.md) skill (`RED -> GREEN -> REFACTOR`).
3. Design deep modules, mock only at system boundaries, test observable behavior, and remove any orphaned/dead exports.
4. Run `yarn guard:domain`, typechecks, builds, and tests before committing.

### Step 5: Human QA Testing Documentation & Visual Proofs
1. Once implementation is complete, activate the [`qa-human-testing`](file:///.agents/skills/qa-human-testing/SKILL.md) skill.
2. Generate automated E2E / visual proofs when applicable.
3. Create `work/<YYYY-MM-DD>_<name>/qa.md` documenting comprehensive instructions for a human tester:
   - Prerequisites, test accounts, seed data, and environment setup.
   - Happy path step-by-step verification flows with expected UI/API/DB outcomes.
   - Edge cases, validation errors, and failure modes.
   - Responsive/cross-device verification checklist.

### Step 6: Merge, CD Verification & Context-Rot Clean-Up
1. Run first-pass PR review with [`pr-reviewer`](file:///.agents/agents/pr-reviewer.md) / [`pr-review`](file:///.agents/skills/pr-review/SKILL.md) and obtain human QA approval.
2. Activate the [`finish-work`](file:///.agents/skills/finish-work/SKILL.md) skill to squash and merge the PR via `gh pr merge <pr_number> --squash --delete-branch`.
3. Track the post-merge CD workflow run on the default branch to completion.
4. Once CD succeeds, record the completed work item in [`work/HISTORY.md`](file:///work/HISTORY.md) and remove `work/<YYYY-MM-DD>_<name>/` from the default branch to prevent context rot.
