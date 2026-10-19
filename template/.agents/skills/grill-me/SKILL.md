---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Uses the Graphify Knowledge Graph, codebase-memory-mcp, and Dual-Guardian pairs to answer [EXTRACTED] questions from code and focus human questions on [AMBIGUOUS] and [INFERRED] design decisions. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

# Grill Me — Socratic Design & Ontology Alignment

Interview the user relentlessly about every aspect of the plan or design until reaching a shared understanding. Walk down each branch of the design decision tree, resolving dependencies between decisions one-by-one.

## Core Rules

1. **Graphify & Codebase First (`[EXTRACTED]` vs `[AMBIGUOUS]`)**:
   - If a question can be answered by exploring the codebase, **explore the codebase instead of asking the user**.
   - Start by checking `graphify-out/GRAPH_REPORT.md` (when present), running `yarn graph:explain "<symbol>"`, `yarn graph:query "<concept>"`, or `yarn graph:path "<from>" "<to>"`, and querying `codebase-memory-mcp` to trace existing tables, services, and UI routes.
   - Never ask the user about facts that are already `[EXTRACTED]` in the AST/schema graph.
   - Focus your interview questions strictly on:
     - **`[AMBIGUOUS]` gaps**: Missing backend tables, conflicting types across workspaces, or unstated product policy.
     - **`[INFERRED]` assumptions**: Multi-hop behaviors, edge-case failure modes, or compliance trade-offs that require explicit product confirmation.

2. **Dual-Guardian Pre-Check**:
   - Inspect [`.agents/backbone.json`](file:///.agents/backbone.json) to identify which domain concepts the feature touches and load the corresponding **Dual-Guardian Pair** (`ontology-*-guardian` $\times$ `business-*-guardian`) from `.agents/agents/`.
   - Use the **Ontology Guardian** to shape your recommended architecture (lean root tables, time-series append-only logs, tenant scoping) and the **Business Guardian** to surface real-world edge cases (regulatory compliance, safety invariants, state machines, immutability).

3. **One Question at a Time with Recommended Answer**:
   - Ask questions **one at a time**.
   - For every question, provide your **recommended answer** first (citing the `[EXTRACTED]` codebase reality and the relevant Guardian invariant), so the user can quickly confirm or override.
