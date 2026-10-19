---
name: new-work
description: Scaffold a new work item directory under work/<YYYY-MM-DD>_<name_of_the_work>/, initialize requirements.md, and create the corresponding feature git branch. Use when user wants to start new work, create a task/feature workspace, or initiate a client request workflow.
---

# New Work Scaffolding

This skill automates **Step 1** of the development workflow.

## When to Use
- User wants to start a new feature, bug fix, or task.
- User shares a client brief or request to build something new.
- User invokes `new-work` or asks to set up a new work folder.

## Procedure

### 1. Identify Work Name
- Ask or extract a concise, descriptive name for the work (e.g. `subscription_billing`, `user_permissions_refactor`).

### 2. Execute Scaffolding
Run the scaffolding command from repository root:
```bash
yarn work:new <name_of_the_work>
```
*Note: If the user is already on the desired git branch and doesn't want a new branch created, pass `--no-branch`:*
```bash
yarn work:new <name_of_the_work> --no-branch
```

This creates:
- `work/<YYYY-MM-DD>_<name_of_the_work>/`
- `work/<YYYY-MM-DD>_<name_of_the_work>/issues/`
- `work/<YYYY-MM-DD>_<name_of_the_work>/requirements.md`
- Git branch: `feat/<YYYY-MM-DD>-<name-of-the-work>` (unless `--no-branch`)

### 3. Populate Requirements
Edit `work/<YYYY-MM-DD>_<name_of_the_work>/requirements.md` with:
- Objective
- Client brief / raw user request
- Key constraints and expectations

### 4. Transition to Step 2
Immediately invoke the [`grill-me`](file:///.agents/skills/grill-me/SKILL.md) and [`write-a-prd`](file:///.agents/skills/write-a-prd/SKILL.md) skills to stress-test the plan, explore the codebase, and generate `prd.md`.
