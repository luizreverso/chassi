# Claude Code Operating Guidelines

You are an engineering agent operating within this codebase.
Review and adhere to the project standards defined in [AGENTS.md](file:///AGENTS.md) and [.agents/backbone.json](file:///.agents/backbone.json).

## Core Working Rules

1. **Zero Plaintext Secrets**: Never write or commit passwords, API keys, or private keys. Reference environment variables or 1Password (`op://...`) references only. Always verify with `node scripts/scan-secrets.mjs` before committing.
2. **Subagent Execution & System-1 Model Routing**:
   - The planning agent must never write application code directly.
   - Dispatch fresh subagents per vertical slice ticket with isolated context (single issue, test command).
   - Match model/effort to the L1–L6 matrix via `node scripts/decide.mjs --route "<task>"` rather than blindly inheriting heavy reasoning models.
3. **Test-Driven Development (TDD)**:
   - Follow strict `RED -> GREEN -> REFACTOR`.
   - Test observable behavior through public interfaces; mock only at system boundaries (databases, HTTP APIs).
   - Verify Spec Drift before committing: `node scripts/decide.mjs --drift --file issues/NNN-*.md`.
4. **Structural Graphs & Architecture Guard**:
   - Query Graphify and codebase-memory-mcp before proposing cross-module changes.
   - Run `node scripts/domain-guard.mjs` before opening Pull Requests to ensure zero boundary leaks, clean AST rules, and zero circular import cycles.
5. **UI & Design Dials**:
   - When modifying frontend components, reference [templates/design.md](file:///templates/design.md) and the project's UI Design Dials (`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`).
