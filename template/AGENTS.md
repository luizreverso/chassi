# Agent Guidelines & Development Workflow

This file defines the standard operational rules for AI agents and developers working in this codebase. Project-specific boundaries, schema paths, commands, and Dual-Guardian mappings are configured in [`.agents/backbone.json`](file:///.agents/backbone.json).

## Standard Development Workflow

Whenever a new work item, feature, bug fix, or client request is initiated:

### 0. Project Onboarding & Domain Bootstrap (Step 0 — Initial Setup or New Domain)
- When initializing this backbone in a repository or adding a new core bounded context, activate the [`bootstrap-guardians`](file:///.agents/skills/bootstrap-guardians/SKILL.md) skill.
- Configures [`.agents/backbone.json`](file:///.agents/backbone.json), scaffolds the paired `ontology-<domain>-guardian.md` $\times$ `business-<domain>-guardian.md` specifications in `.agents/agents/`, and adds baseline `.ast-grep/rules/`.

### 1. Work Folder & Specification (Step 1)
- All work items must be tracked in the `work/` directory.
- Scaffold using `yarn work:new <name_of_the_work>` or the [`new-work`](file:///.agents/skills/new-work/SKILL.md) skill.
- Creates `work/<YYYY-MM-DD>_<name_of_the_work>/` and initializes `requirements.md` containing:
  - What we want to build or what the user/client requested.
  - Background context, requirements, and constraints.

### 2. "Grill Me" Plan & PRD Alignment (Step 2)
- Before jumping into implementation, activate the [`grill-me`](file:///.agents/skills/grill-me/SKILL.md) skill.
- Interview the user relentlessly about every aspect of the plan or design until reaching shared understanding.
- Walk down each branch of the decision tree, resolving dependencies between decisions one-by-one.
- For each question:
  - Provide your recommended answer.
  - Ask questions **one at a time**.
  - **Graphify & Codebase-first**: Query `graphify-out/GRAPH_REPORT.md` (when present), `yarn graph:explain` / `yarn graph:query`, and `codebase-memory-mcp` first. Never ask the user about facts already `[EXTRACTED]` in the AST/schema graph; focus human questions on `[AMBIGUOUS]` and `[INFERRED]` design decisions.
- If UI is involved, establish the project's **UI Design Dials** (1–10 scale: `DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`) from [`templates/design.md`](file:///templates/design.md).
- Author the formal PRD (`work/<YYYY-MM-DD>_<name>/prd.md`) using the [`write-a-prd`](file:///.agents/skills/write-a-prd/SKILL.md) skill.
- **The Goldfish Cold-Review Gate (EGM Pattern)**: Submit the PRD to an isolated zero-context subagent (`invoke_subagent(Model="flash")`) to test comprehension, discover edge cases, and ensure implementation readiness before slicing.

### 3. Tracer-Bullet Issue Slicing (Step 3)
- Activate the [`prd-to-issues`](file:///.agents/skills/prd-to-issues/SKILL.md) skill to decompose the PRD into vertical, verifiable tracer bullet issues (`issues/NNN-*.md`).
- Classify issues as `HITL` (human-in-the-loop review) or `AFK` (autonomous execution).
- Route each slice to its optimal **Model Tier** (`L1`–`L6`) using `node scripts/decide.mjs --route`.
- Quiz user on slice granularity, dependencies, model tiers, and validation paths.

### 4. Test-Driven Implementation (Step 4)
- Work on a dedicated git branch (`feat/<date>-<name>`).
- Execute issues using the [`tdd`](file:///.agents/skills/tdd/SKILL.md) skill (`RED -> GREEN -> REFACTOR`).
- Respect `Type: HITL` (confirm interface plan first) vs. `Type: AFK` (execute vertical slice autonomously through `RED -> GREEN -> REFACTOR -> guard:domain -> typecheck -> test`).
- Design deep modules guided by the [`code-architect`](file:///.agents/agents/code-architect.md) agent, mock only at system boundaries, and test observable behavior.
- **Spec Drift Gate (EGM Pattern)**: Verify that implementation matches the issue specifications without unstated drift or scope creep:
  ```bash
  node scripts/decide.mjs --drift --file issues/NNN-*.md
  ```
- Eliminate orphaned exports and dead code before committing.

### 5. Human QA Testing Documentation & Visual Proofs (Step 5)
- Activate the [`qa-human-testing`](file:///.agents/skills/qa-human-testing/SKILL.md) skill once implementation is complete.
- Create `work/<YYYY-MM-DD>_<name>/qa.md` documenting comprehensive instructions for a human tester:
  - Prerequisites, test accounts, seed data, and environment setup.
  - Happy path step-by-step verification flows with expected UI/API/DB outcomes.
  - Edge cases, validation errors, and failure modes.
  - Responsive/cross-device verification checklist and visual proofs (stateless Playwright CLI screenshots).
  - Run `npx -y impeccable detect` for frontend changes to catch deterministic UI anti-patterns.

### 6. PR Creation, Merge & Context-Rot Clean-Up (Step 6)
- Create structured pull requests targeting the default branch using the [`git-pr-workflow`](file:///.agents/skills/git-pr-workflow/SKILL.md) skill.
- Activate the [`finish-work`](file:///.agents/skills/finish-work/SKILL.md) skill once code review and human QA sign-off are complete.
- Squash and merge the PR via `gh pr merge <pr_number> --squash --delete-branch`.
- Track the triggered CD deployment workflow run on the default branch to completion.
- Once deployment succeeds:
  - Record the completed work item and PR link in [`work/HISTORY.md`](file:///work/HISTORY.md).
  - Remove `work/<YYYY-MM-DD>_<name>/` from the default branch to prevent context rot and ensure future AI sessions never encounter stale requirements.
  - The permanent engineering record remains preserved forever in the GitHub PR and commit history.

---

## Autonomous PR Code Review Agent

- Open Pull Requests are reviewed using the [`pr-reviewer`](file:///.agents/agents/pr-reviewer.md) agent or [`pr-review`](file:///.agents/skills/pr-review/SKILL.md) skill.
- The review agent uses `gh pr view`, `gh pr diff`, `yarn graph:update`, and `yarn guard:domain --full` to perform a rigorous first-pass code review auditing:
  1. **Security**: Secrets, sanitization, authentication, and tenant authorization.
  2. **Type Safety & Correctness**: Strict type checks, schema/DTO validation, error handling.
  3. **Architecture & Graph Topology**: Deep modules, zero import cycles, zero God-Node degree spikes or surprising cross-domain bridges in `graphify-out/GRAPH_REPORT.md`.
  4. **Testing Quality**: Behavioral tests over brittle mock tests.
  5. **Infrastructure & Operational Constraints**: Preserving cost-effective infrastructure and zero drift.
  6. **Domain Dual-Guardian Compliance & Epistemic Tagging**: Every finding is tagged `[EXTRACTED]`, `[INFERRED]`, or `[AMBIGUOUS]`.
- Posts constructive review feedback directly to GitHub via `gh pr review`.

---

## Domain & Ontology Dual Guardians

Every core domain concept in the repository is governed by a **Dual-Guardian Pair** registered in [`.agents/backbone.json`](file:///.agents/backbone.json) and operating in collaborative dialectic:
1. **Architectural & Technical Guardian (`ontology-*-guardian`)**: Guards logic quality, security, schema purity, multi-tenant boundaries, and architecture (see starter template: [`ontology-template-guardian`](file:///.agents/agents/ontology-template-guardian.md)).
2. **Business & Domain Guardian (`business-*-guardian`)**: Guards real-world business safety, regulatory compliance, domain state machines, and user workflows (see starter template: [`business-template-guardian`](file:///.agents/agents/business-template-guardian.md)).

### The Collaboration Protocol:
- **Business Guardians** evaluate whether features, calculations, and state transitions follow real-world domain laws, compliance rules, and safety invariants.
- **Technical Guardians** validate that proposed changes preserve lean root entity schemas, maintain time-series fidelity, prevent cross-tenant data leaks, and avoid platform-siloed tables.
- **Audit & Onboarding Skills**:
  - Use the [`ontology-audit`](file:///.agents/skills/ontology-audit/SKILL.md) skill to survey the codebase via Graphify and `codebase-memory-mcp`, summon the paired guardians for any concept, and produce actionable improvement reports.
  - Use the [`bootstrap-guardians`](file:///.agents/skills/bootstrap-guardians/SKILL.md) skill (Step 0) when onboarding a new project or adding a new bounded context to [`.agents/backbone.json`](file:///.agents/backbone.json).

---

## System-1 Decision Gate, Graphify Knowledge Graph & Guardrails

- **System-1 Decision Gate & Router ([`scripts/decide.mjs`](file:///scripts/decide.mjs))**:
  - `node scripts/decide.mjs --route <prompt>`: Calibrates task complexity across the 6-Level Model & Effort Matrix (`L1`–`L6`) for Antigravity, Claude Code, and Cursor.
  - `node scripts/decide.mjs --drift --file <issue.md>`: Evaluates Spec Drift (EGM Pattern) comparing git diff vs. issue criteria.
  - `node scripts/decide.mjs --noul <question>`: Fast Boolean binary gate with logprob probability.
  - `node scripts/decide.mjs --choice <A,B,C> <prompt>`: Constrained enum classification.
- **Agnostic Project Adapter ([`.agents/backbone.json`](file:///.agents/backbone.json))**:
  - Declares workspace isolation rules, cross-layer import restrictions, schema/migration paths, Graphify topology rules, verification commands, and Dual-Guardian file triggers.
- **Graph-First Codebase Navigation (`Graphify` + `codebase-memory-mcp`)**:
  - Before globbing or grepping raw files across the codebase, check `graphify-out/GRAPH_REPORT.md` (when present).
  - Use `yarn graph:explain "<symbol>"`, `yarn graph:query "<concept>"`, and `yarn graph:path "<nodeA>" "<nodeB>"` for architectural topology.
  - Use **`codebase-memory-mcp`** for cross-boundary symbol, call-chain, and HTTP route tracing.
  - Run `yarn graph:update` (or let `.husky/post-commit` update automatically) after modifying source code.
- **Structural AST Linting & Codemods (`ast-grep`)**:
  - Configured via [`sgconfig.yml`](file:///sgconfig.yml) and [`.ast-grep/rules/`](file:///.ast-grep/rules/).
  - Run `yarn ast:scan` to check Dual-Guardian AST rules and `yarn ast:test` to run rule unit tests.
- **Version-Accurate Framework Docs (`Context7` MCP)**:
  - Query `context7` MCP during Step 4 (`tdd`) for live, version-specific documentation on external libraries and frameworks.
- **Epistemic Confidence Tags**:
  - All ontology audits and PR reviews tag claims with **`[EXTRACTED]`** (proven in AST/SQL/code), **`[INFERRED]`** (reasoned from multi-hop call graphs/mocks), or **`[AMBIGUOUS]`** (missing spec or conflicting definition requiring human decision).
- **Deterministic Pre-Commit & CI Guard (`yarn guard:domain`)**:
  - Enforced by [`scripts/domain-guard.mjs`](file:///scripts/domain-guard.mjs) (reading [`.agents/backbone.json`](file:///.agents/backbone.json)) in `.husky/pre-commit` and CI:
    1. Blocks illegal cross-workspace imports using path-resolved specifier analysis.
    2. Blocks forbidden cross-layer imports configured in `boundaries.layerRules`.
    3. Runs `ast-grep scan` against `.ast-grep/rules/` on modified source files.
    4. Blocks destructive SQL (`DROP TABLE`, `DROP COLUMN`, `TRUNCATE`) in `.sql` migrations without `-- @guardian-approved: <reason>`.
    5. Enforces zero circular import cycles (`Import Cycles: None detected`) in `graphify-out/GRAPH_REPORT.md` (when present).
    6. Verifies Anti-Doc-Rot across `AGENTS.md`, `.agents/agents/*.md`, and `.agents/skills/*/SKILL.md` so no `file://` reference ever points to a non-existent path.
    7. Prints the activated Dual-Guardian checklist whenever domain files are staged.
