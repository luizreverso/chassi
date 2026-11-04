# Chassi

A project-agnostic AI software engineering chassis and development backbone that combines **System-1 Decision Gates & Model/Effort Routing**, **Self-Cleaning Ephemeral Specs**, **Dialectical Dual-Guardian Ontology Governance**, **Two-Tier Structural Code Graphs (`Graphify` + `codebase-memory-mcp`)**, and **Deterministic AST & Anti-Doc-Rot Guardrails (`domain-guard.mjs` + `ast-grep`)**.

---

## Core Architecture & Philosophy

```mermaid
flowchart TD
    subgraph Lifecycle["Self-Cleaning 6+1 Step Development Lifecycle"]
        S0["Step 0: bootstrap-guardians<br/>(Map domains, configure backbone.json,<br/>scaffold Dual-Guardians & AST rules)"]
        S1["Step 1: new-work<br/>(Scaffold work/YYYY-MM-DD_name/requirements.md)"]
        S2["Step 2: grill-me + write-a-prd<br/>(Graph-first interview, UI dials, Dual-Guardian audit,<br/>Goldfish Cold-Review Gate)"]
        S3["Step 3: prd-to-issues<br/>(Vertical tracer-bullet slices:<br/>HITL vs. AFK + L1-L6 Model Tiering)"]
        S4["Step 4: tdd + code-architect<br/>(RED -> GREEN -> REFACTOR +<br/>Spec Drift Gate + Dead-code hygiene)"]
        S5["Step 5: qa-human-testing<br/>(Generate qa.md + E2E visual proofs +<br/>impeccable detect UI checks)"]
        S6["Step 6: git-pr-workflow + finish-work<br/>(Conventional PR, squash-merge, verify CD,<br/>log HISTORY.md & delete work/<folder>)"]
        S0 --> S1 --> S2 --> S3 --> S4 --> S5 --> S6
    end
```

### The 6 Pillars

1. **System-1 Decision Gate, Spec Drift Gate & 6-Tier Router (`scripts/decide.mjs`)**
   - **6-Level Model & Effort Matrix (`L1`–`L6`)**: Dynamically routes prompts and slices to the optimal model and reasoning effort across Antigravity CLI/UI, AGY Subagent Tool (`flash_lite`, `flash`, `pro`), Claude Code CLI, and Cursor.
   - **Spec Drift Gate (EGM Pattern)**: Evaluates git diffs against acceptance criteria (`- [ ] ...`) to prevent unstated scope creep, unexpected database mutations, or secret leaks before code review.
   - **Fast Non-Generative Primitives**: `--noul` (Boolean), `--choice` (constrained enum), and `--score` (ordinal evaluation) with calibrated offline heuristic fallback (<15ms).
2. **Self-Cleaning Ephemeral Specs (Zero Context Rot)**
   - Active specifications (`requirements.md`, `prd.md`, `issues/NNN-*.md`, `qa.md`) live in `work/<YYYY-MM-DD>_<name>/` only while the work is in flight.
   - Upon PR squash-merge and CD verification (`finish-work`), a permanent one-line record with the PR link is appended to `work/HISTORY.md`, and `work/<YYYY-MM-DD>_<name>/` is deleted from the default branch so future AI sessions never suffer from stale specification rot.
3. **The Goldfish Cold-Review Gate & UI Design Dials**
   - **Goldfish Cold-Review Gate**: Dispatches an isolated, zero-context subagent to attack `prd.md` cold before slicing, finding blind spots that were invisible to the planning conversation.
   - **UI Design Dials (`templates/design.md`)**: Configures `DESIGN_VARIANCE`, `MOTION_INTENSITY`, and `VISUAL_DENSITY` on a 1–10 scale alongside ready-to-use design system presets (`linear-dark.md`, `b2b-clean.md`, `editorial-carnage.md`, `clinical-clean.md`).
4. **Dialectical Dual-Guardians (`ontology-*-guardian` $\times$ `business-*-guardian`)**
   - Every core bounded context is governed by a paired **Technical/Ontology Guardian** (who fights God tables, scalar overwrites of time-series metrics, platform-coupled naming, and cross-tenant leaks) and **Business/Domain Guardian** (who enforces domain laws, state-machine invariants, regulatory compliance, and safety).
5. **Two-Tier Structural Code Intelligence (`Graphify` + `codebase-memory-mcp`)**
   - **Macro-Topology (`Graphify`)**: Leiden community clustering, cohesion scores, God-Node degree centrality, surprising cross-community bridges, and circular import detection—updated at zero token cost in `.husky/post-commit`.
   - **Micro-Tracing (`codebase-memory-mcp`)**: LSP-backed symbol navigation, call-path tracing, dead-code/unused-export detection, and cross-service HTTP route resolution.
6. **Deterministic AST & Anti-Doc-Rot Guardrails (`domain-guard.mjs` + `ast-grep`)**
   - Driven declaratively by `.agents/backbone.json`:
     - Path-resolved workspace/app boundary isolation
     - Cross-layer import leak blocking (e.g., preventing UI from importing DB layers)
     - Zero-drift schema-to-migration checks + destructive SQL migration blocking (`DROP TABLE`, `DROP COLUMN`, `TRUNCATE` require `-- @guardian-approved: <reason>`)
     - Unit-tested `ast-grep` YAML rules (`.ast-grep/rules/` & `.ast-grep/tests/`)
     - Deterministic zero-cycle enforcement on `graphify-out/GRAPH_REPORT.md`
     - Anti-Doc-Rot verification ensuring every `file://` link in `AGENTS.md` and `.agents/` resolves on disk

---

## Quick Start

### Option A: Install into an Existing or New Repository via CLI

Run the installer pointing to any target repository:

```bash
node /path/to/chassi/bin/init.mjs /path/to/target-repo
```

Optional flags:
- `--name <project-name>`: Override the project name written into `.agents/backbone.json` and `templates/design.md` (defaults to target folder name).
- `--branch <default-branch>`: Override the default git branch (`main` or `master`, auto-detected when git is initialized).
- `--force`: Overwrite existing backbone files in the target repository.

### Option B: Copy `template/` Directly for a Brand-New Project

```bash
cp -R /path/to/chassi/template/. /path/to/new-project/
```

---

## Onboarding a Project After Installation (Step 0)

Once installed in your target repository:

1. Build the initial structural graphs:
   ```bash
   yarn graph:build
   yarn cbm:index
   ```
2. Ask your AI agent to run the **`bootstrap-guardians`** skill:
   > *"Run `bootstrap-guardians` to inspect our project structure, configure `.agents/backbone.json`, scaffold our Dual-Guardian pairs, and add initial `.ast-grep/rules/`."*
3. Verify the guardrails:
   ```bash
   yarn ast:test
   yarn guard:domain --full
   yarn decide --route "Explain project architecture"
   ```
