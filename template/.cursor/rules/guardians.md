# Cursor Rule: Dual-Guardian Ontology & Domain Governance

Adhere to the Dual-Guardian architecture defined in [AGENTS.md](file:///AGENTS.md) and [.agents/backbone.json](file:///.agents/backbone.json).

- **Architectural Guardian (`ontology-*-guardian.md`)**:
  - Enforce lean root entities (no God tables).
  - Enforce time-series append-only logs for fluctuating metrics instead of destructive scalar overwrites.
  - Name tables and models after core domain concepts, not transient client UI platforms.
- **Business Guardian (`business-*-guardian.md`)**:
  - Enforce domain state machines, regulatory invariants, and financial safety rules.
  - Require audit logging for sensitive lifecycle transitions.
- **Verification**: Run `node scripts/domain-guard.mjs --full` and `PATH="$HOME/.local/bin:$PATH" ast-grep test` to ensure invariants hold.
