---
name: bootstrap-guardians
description: Step 0 onboarding skill for new projects or new bounded contexts. Scans the repository using Graphify and codebase-memory-mcp (or reads a project brief), initializes or updates .agents/backbone.json, scaffolds Dual-Guardian pairs (ontology-*-guardian.md x business-*-guardian.md), and creates baseline .ast-grep/rules/. Use when bootstrapping this AI development backbone in a new project or adding a new core domain.
---

# Bootstrap Guardians & Project Backbone (Step 0)

This skill makes the AI development workflow **project-agnostic**. When adopting this workflow in a new repository—or introducing a new bounded context to an existing repository—run this skill to configure [`.agents/backbone.json`](file:///.agents/backbone.json), generate the **Dual-Guardian Pairs**, and wire structural AST guardrails.

---

## Procedure

### 1. Discover Project Topology & Stack
1. **Build or Update Structural Graphs**:
   - If the repository already has source code, run `yarn graph:build` (or `graphify extract . --code-only && GRAPHIFY_BACKEND=none graphify cluster-only .`) to generate `graphify-out/GRAPH_REPORT.md`.
   - Run `codebase-memory-mcp` indexing (`yarn cbm:index` / `index_repository`).
2. **Identify Core Bounded Contexts**:
   - Inspect the Leiden communities and God Nodes in `graphify-out/GRAPH_REPORT.md`, database schema files (Drizzle, Prisma, SQL, SQLAlchemy, etc.), and workspace folders.
   - For a greenfield project, read the initial project brief or README.
   - Propose 4–6 core domain concepts (e.g., `Identity`, `Catalog`, `Billing`, `Operations`, etc.) and confirm them with the user.

### 2. Initialize or Update `.agents/backbone.json`
Configure [`.agents/backbone.json`](file:///.agents/backbone.json) with the project's concrete adapter settings:
- **`boundaries`**: Workspace root, isolated apps/packages, shared modules, and cross-layer import restrictions (e.g., preventing UI from importing DB drivers directly).
- **`schemas`**: Primary database schema file, migration directories, and canonical API contract paths.
- **`graph`**: Path to `graphify-out/GRAPH_REPORT.md` and `enforceZeroCycles: true`.
- **`commands`**: Project-specific commands for `guard`, `astScan`, `astTest`, `graphUpdate`, `typecheck`, and `test`.
- **`guardians`**: Register each domain concept with its `ontologyAgent`, `businessAgent`, and file/path `triggers`.

### 3. Scaffold Dual-Guardian Specifications
Using [`ontology-template-guardian.md`](file:///.agents/agents/ontology-template-guardian.md) and [`business-template-guardian.md`](file:///.agents/agents/business-template-guardian.md) as templates, create the dialectical pair in `.agents/agents/` for each domain `<domain>`:

1. **`.agents/agents/ontology-<domain>-guardian.md` (Technical & Architectural Guardian)**:
   - **Governed Conceptual Facets**: Table of root entity vs. conceptual decorator facets.
   - **Core Invariants**:
     - *Invariant 1 — Lean Root Entity (Anti-God Table)*: Root identity tables hold only immutable identity; specialized telemetry lives in facet tables.
     - *Invariant 2 — Time-Series Over Scalar Telemetry*: Fluctuating metrics use append-only timestamped logs, never destructive scalar overwrites.
     - *Invariant 3 — Concepts Over Platforms*: Tables and DTOs are named after timeless domain concepts, never client apps.
     - *Invariant 4 — Provenance & Multi-Tenant Isolation*: Every mutation records actor authority and enforces tenant boundaries.
2. **`.agents/agents/business-<domain>-guardian.md` (Business & Regulatory Guardian)**:
   - **Domain Laws & State Machines**: Valid lifecycle transitions, regulatory/compliance rules, financial/safety invariants, and forbidden destructive operations.
   - **Edge-Case & UX Mandates**: Consent flows, audit trails, and fallback behaviors.

### 4. Encode Deterministic AST Rules (`.ast-grep/`)
Translate the most critical Guardian invariants into deterministic [`ast-grep`](file:///sgconfig.yml) rules under `.ast-grep/rules/` with matching unit tests in [`.ast-grep/tests/rules-test.yml`](file:///.ast-grep/tests/rules-test.yml):
- Block hard deletes (`DELETE` / `.delete(...)`) on legally or financially immutable tables.
- Block destructive raw SQL (`DROP TABLE`, `TRUNCATE`) in runtime code.
- Warn on scalar overwrites of time-series attributes.

### 5. Verify Guardrails End-to-End
Run the verification suite to confirm zero doc-rot and passing AST tests:
```bash
yarn ast:test
yarn guard:domain --full
```
