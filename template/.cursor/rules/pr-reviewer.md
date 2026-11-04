# Cursor Rule: PR Review & Epistemic Verification

Adhere to the PR Reviewer standards defined in [.agents/agents/pr-reviewer.md](file:///.agents/agents/pr-reviewer.md).

- **Epistemic Confidence**: Label findings as `[EXTRACTED]` (verified from code/AST), `[INFERRED]` (reasoned from indirect evidence), or `[AMBIGUOUS]` (missing spec or conflicting decision).
- **Core Audits**: Security & zero secrets, strict typing, architecture & graph topology (zero import cycles), and behavioral test quality.
- **Dual-Guardian Alignment**: Check compliance with the domain's ontology and business guardian invariants registered in [.agents/backbone.json](file:///.agents/backbone.json).
