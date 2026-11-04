---
name: prd-to-issues
description: Break a PRD into independently-workable issues with Model Tier (L1-L6) and Type (HITL/AFK), and write each as a local markdown file in issues/ or within the active work folder.
---

# PRD to Issues

Break a PRD into independently-grabbable issues using vertical slices (tracer bullets), written as local markdown files.

## Process

### 1. Locate the PRD

Locate the PRD file path:
- If running within the work workflow, locate `work/<current_date>_<name_of_the_work>/prd.md`.
- Otherwise, ask the user or check `issues/prd.md`.

If the PRD is not already in your context window, read it from the file.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code.

### 3. Draft vertical slices

Break the PRD into **tracer bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be `HITL` or `AFK`. `HITL` slices require human interaction, such as an architectural decision or a design review. `AFK` slices can be implemented and verified autonomously without human interaction. Prefer `AFK` over `HITL` where possible.

Assign each slice a **Model Tier** (`L1`–`L6`) using `node scripts/decide.mjs --route`:
- `L1`: Lookup, docs, and trivial fixes (Gemini 3.8 Flash-Lite, Low effort)
- `L2`: Scaffolding, config, CSS tokens (Gemini 3.8 Flash, Low effort)
- `L3`: Standard `[AFK]` vertical-slice TDD (Gemini 3.8 Flash, Medium effort)
- `L4`: `[HITL]` slices, complex domain scoping, IaC (Gemini 3.8 Pro, Medium effort)
- `L5`: Database migrations, security hardening, PR review (Gemini 4 Argon, Medium effort)
- `L6`: Multi-module deep architectural refactoring (Gemini 4 Argon, High effort)

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
</vertical-slice-rules>

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Model Tier**: `L1`–`L6` (via [scripts/decide.mjs](file:///scripts/decide.mjs))
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories from the PRD this addresses

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL/AFK and assigned the right `L1`–`L6` Model Tier?

Iterate until the user approves the breakdown.

### 5. Create the issue files

For each approved slice, write a markdown file:
- Write to `work/<current_date>_<name_of_the_work>/issues/NNN-short-title.md` (or `issues/NNN-short-title.md` if working globally).
- Number issues starting from the next available number (check what files already exist).
- Create files in dependency order (blockers first) so you can reference real filenames in the "Blocked by" field.
- Do NOT use `gh issue create` or any GitHub CLI commands. Do NOT reference GitHub issue numbers. Use local filenames for all cross-references.

<issue-template>
## Parent PRD

`<path-to-prd.md>`

## Type
[AFK / HITL]

## Model Tier
[L1 / L2 / L3 / L4 / L5 / L6] — e.g. `L3` (`Gemini 3.8 Flash` / Effort: `Medium` | Subagent: `flash` | Claude: `sonnet --effort medium`)

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation. Reference specific sections of the parent PRD rather than duplicating content.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- Blocked by `NNN-title.md` (if any)

Or "None - can start immediately" if no blockers.

## User stories addressed

Reference by number from the parent PRD:

- User story 3
- User story 7

</issue-template>

Do NOT close or modify the parent PRD file.
