# Cursor Rule: Code Architect & Deep Modules

Adhere to the Code Architect standards defined in [.agents/agents/code-architect.md](file:///.agents/agents/code-architect.md).

- **Deep Modules**: Strive for components with small, simple public interfaces that hide significant internal complexity.
- **Defensive Types**: Strict TypeScript, zero unvalidated external input, explicit schemas (e.g. Zod).
- **Workspace Isolation**: Never import database drivers or server code into client apps. Respect boundaries in [.agents/backbone.json](file:///.agents/backbone.json).
- **Spec Drift Gate**: Run `node scripts/decide.mjs --drift --file issues/NNN-*.md` to ensure implementation does not drift from criteria.
- **Zero Secrets**: Never commit plaintext API keys or credentials; use `node scripts/scan-secrets.mjs`.
