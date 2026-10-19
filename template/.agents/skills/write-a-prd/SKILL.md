---
name: write-a-prd
description: Generate a PRD from the client brief and write it as a local markdown file in work/<date>_<name>/prd.md. Use when the user wants to turn a client request into a structured PRD.
---

This skill will be invoked when the user wants to create a PRD. You may skip steps if you don't consider them necessary.

1. Ask the user for a detailed description of the problem they want to solve and any potential ideas for solutions (or read `work/<current_date>_<name_of_the_work>/requirements.md`).

2. Explore the repo (via `graphify-out/GRAPH_REPORT.md` and `codebase-memory-mcp`) to verify their assertions and understand the current state of the codebase.

3. Interview the user relentlessly about every aspect of this plan until you reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.

4. Sketch out the major modules you will need to build or modify to complete the implementation. Actively look for opportunities to extract deep modules that can be tested in isolation.

A deep module (as opposed to a shallow module) is one which encapsulates a lot of functionality in a simple, testable interface which rarely changes.

Check with the user that these modules match their expectations. Check with the user which modules they want tests written for.

5. Once you have a complete understanding of the problem and solution, use the template below to write the PRD:
   - Write the PRD to the active work folder: `work/<current_date>_<name_of_the_work>/prd.md` (or `issues/prd.md` if running outside a work folder).
   - Do NOT submit a GitHub issue or call any external service.

<prd-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

This list of user stories should be extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

## Domain Dual-Guardians Alignment

Mandatory audit and sign-off by the relevant Dual-Guardian pair(s) configured in [`.agents/backbone.json`](file:///.agents/backbone.json) before proceeding to Step 3:
- **Governed Ontologies Touched**: [List domains from `.agents/backbone.json`]
- **Architectural Guardian Audit (`ontology-*-guardian`)**:
  - Lean root entity verification (zero schema bloat on core tables).
  - Time-series fidelity check (append-only historical telemetry vs. scalar overwrite columns).
  - Facet naming purity (named after timeless domain concepts, never client platforms).
- **Business Guardian Audit (`business-*-guardian`)**:
  - Regulatory, financial, and operational safety check.
  - State machine transitions and immutability validation.
  - Permission, sovereignty, and tenant trust boundaries.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature.

</prd-template>
