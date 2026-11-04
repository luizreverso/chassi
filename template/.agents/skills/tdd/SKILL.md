---
name: tdd
description: Test-driven development with red-green-refactor loop, dead-code hygiene, and Spec Drift Gate verification.
---

# Test-Driven Development

## Philosophy

**Core principle**: Tests should verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't.

**Good tests** are integration-style: they exercise real code paths through public APIs. They describe _what_ the system does, not _how_ it does it. A good test reads like a specification - "user can checkout with valid cart" tells you exactly what capability exists. These tests survive refactors because they don't care about internal structure.

**Bad tests** are coupled to implementation. They mock internal collaborators, test private methods, or verify through external means (like querying a database directly instead of using the interface). The warning sign: your test breaks when you refactor, but behavior hasn't changed. If you rename an internal function and tests fail, those tests were testing implementation, not behavior.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.** This is "horizontal slicing" - treating RED as "write all tests" and GREEN as "write all code."

**Correct approach**: Vertical slices via tracer bullets. One test → one implementation → repeat. Each test responds to what you learned from the previous cycle.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

## Workflow

### 1. Planning (`HITL` vs. `AFK` Slice Mode)

Check the active issue file (`issues/NNN-*.md`) for its execution mode (`Type: HITL` vs. `Type: AFK`):

- **If `Type: HITL` (or ad-hoc task without an issue file)**:
  - [ ] Confirm with user what interface changes are needed
  - [ ] Confirm with user which behaviors to test (prioritize)
  - [ ] Identify opportunities for [deep modules](deep-modules.md) (small interface, deep implementation)
  - [ ] Design interfaces for [testability](interface-design.md)
  - [ ] List the behaviors to test (not implementation steps)
  - [ ] Get user approval on the plan before writing code
- **If `Type: AFK` (Autonomous Execution Slice)**:
  - The interface and acceptance criteria were already approved in the PRD and Step 3 issue quiz.
  - Do **not** pause to ask the user for permission before starting. Proceed directly through `RED -> GREEN -> REFACTOR`, run `yarn guard:domain` + `typecheck` + `test`, mark the issue acceptance criteria `[x]`, and advance to the next unblocked `AFK` slice.

**You can't test everything.** Focus testing effort on critical paths and complex logic, not every possible edge case.

### 2. Tracer Bullet

Write ONE test that confirms ONE thing about the system:

```
RED:   Write test for first behavior → test fails
GREEN: Write minimal code to pass → test passes
```

This is your tracer bullet - proves the path works end-to-end.

### 3. Incremental Loop

For each remaining behavior:

```
RED:   Write next test → fails
GREEN: Minimal code to pass → passes
```

Rules:

- One test at a time
- Only enough code to pass current test
- Don't anticipate future tests
- Keep tests focused on observable behavior

### 4. Refactor, Dead-Code Hygiene & Spec Drift Verification

After all tests pass, look for [refactor candidates](refactoring.md):

- [ ] Extract duplication
- [ ] Deepen modules (move complexity behind simple interfaces)
- [ ] Apply SOLID principles where natural
- [ ] **Eliminate orphaned / dead code**: Check modified files via `codebase-memory-mcp` (`trace_path` / `search_graph`) to ensure no unused helper functions, orphaned DTOs, or unreferenced exports were left behind during iteration
- [ ] **Spec Drift Gate (EGM Pattern)**: Verify that implementation matches the issue specifications without unstated drift or scope creep:
  ```bash
  node scripts/decide.mjs --drift --file issues/NNN-*.md
  ```
- [ ] **UI Dials**: If UI was built, verify alignment with `templates/design.md` dials (`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`).
- [ ] Run `yarn guard:domain` and tests after each refactor step

**Never refactor while RED.** Get to GREEN first.

## Checklist Per Cycle

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Code is minimal for this test
[ ] Spec Drift Gate passed (node scripts/decide.mjs --drift --file issues/NNN-*.md)
[ ] Zero dead exports or orphaned helpers left behind
```
