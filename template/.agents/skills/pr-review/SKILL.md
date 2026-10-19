---
name: pr-review
description: Perform a thorough first-pass code review on a GitHub Pull Request using GitHub CLI (gh), the Graphify Knowledge Graph, codebase-memory-mcp, and the pr-reviewer agent. Audits security, architecture, type correctness, testing coverage, structural graph impact, and Dual-Guardian compliance with epistemic confidence tags. Use when asked to review a PR or run a code review.
---

# Pull Request Code Review Workflow

This skill automates a thorough first-pass code review on any open GitHub Pull Request using `gh` CLI, the **Graphify Knowledge Graph**, `codebase-memory-mcp`, and the **Dual-Guardian** system configured in [`.agents/backbone.json`](file:///.agents/backbone.json).

## How to Run

### Method 1: Subagent Delegation (Recommended)
Invoke the specialized [`pr-reviewer`](file:///.agents/agents/pr-reviewer.md) subagent:
```json
{
  "TypeName": "pr-reviewer",
  "Role": "PR Reviewer",
  "Prompt": "Review PR #<number>. Check diff using gh pr diff <number>, run yarn graph:update and yarn guard:domain --full, analyze architecture, security, type-safety, structural graph impact, and Dual-Guardian compliance, and submit a constructive review comment with [EXTRACTED | INFERRED | AMBIGUOUS] confidence tags."
}
```

### Method 2: Direct Execution
If executing directly within the current agent context:

1. **Inspect PR Overview & Status**:
   ```bash
   gh pr view <pr_number> --json title,body,author,headRefName,baseRefName,statusCheckRollup
   ```

2. **Inspect Code Changes & Structural Graph Impact**:
   ```bash
   gh pr diff <pr_number>
   yarn graph:update
   yarn guard:domain --full
   ```
   - Inspect `graphify-out/GRAPH_REPORT.md` (when present) and run `yarn graph:explain "<symbol>"` on modified handlers/tables.

3. **Audit Against Code Review Standards**:
   - **Correctness & Type Safety**:
     - Strict static type compliance, no unsafe casts.
     - Proper error handling and async error propagation.
   - **Security**:
     - Zero committed API keys, tokens, or plaintext secrets.
     - Proper authentication and tenant authorization checks on backend endpoints.
     - Strict input validation via schemas/DTOs.
   - **Architecture & Graph Topology**:
     - Deep modules (small interface, robust implementation) vs. shallow wrappers.
     - Zero new import cycles (`Import Cycles` in `GRAPH_REPORT.md`).
     - No unintended **God-Node degree spikes** or **Surprising cross-community connections** violating domain boundaries.
   - **Testing Integrity**:
     - Tests assert observable behavior via public APIs, not internal mock state.
     - Critical edge cases and failure modes covered.
   - **Domain Dual-Guardian Compliance**:
     - Check [`.agents/backbone.json`](file:///.agents/backbone.json) for domains touched by the PR and audit against the relevant Dual-Guardian pair:
       - `ontology-*-guardian`: Confirms lean schemas, time-series telemetry, and facet naming.
       - `business-*-guardian`: Confirms business rules, safety invariants, and state transitions.

4. **Tag Findings with Epistemic Confidence & Post Review**:
   Prefix every review finding with its epistemic tag:
   - **`[EXTRACTED]`**: Proven defect or invariant violation directly visible in the diff or AST.
   - **`[INFERRED]`**: Multi-hop behavioral or structural risk inferred from call graphs.
   - **`[AMBIGUOUS]`**: Missing specification or domain question requiring author confirmation.

   Submit the review as a comment on GitHub:
   ```bash
   gh pr review <pr_number> --comment --body "<markdown_review_summary>"
   ```
