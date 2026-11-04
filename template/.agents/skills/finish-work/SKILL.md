---
name: finish-work
description: Conclude a finished work item by verifying PR status via gh, squash-merging, monitoring the deployment pipeline on the default branch, logging to work/HISTORY.md, and cleaning up the completed work directory to prevent context rot. Respects the ownership gate in .agents/backbone.json (internal vs client-owned).
---

# Finish Work: Merge, Deployment Verification & Context-Rot Cleanup

This skill defines **Step 6** of the development workflow.

## ⚠️ Repository Ownership Gate

Before performing any action, verify repository ownership in [`.agents/backbone.json`](file:///.agents/backbone.json):
- **`"ownership": "internal"`** (Internal or team-owned repositories):
  ✅ **Full lifecycle permitted**: automated squash-merge, deployment monitoring, enduring record in `work/HISTORY.md`, and completed work folder deletion.
- **`"ownership": "client"`** (External client-owned repositories):
  ⛔ **Automated squash-merge & work deletion restricted**:
  - Stop after opening the PR ([`.agents/skills/git-pr-workflow/SKILL.md`](file:///.agents/skills/git-pr-workflow/SKILL.md)).
  - Attach visual QA proof ([`.agents/skills/qa-human-testing/SKILL.md`](file:///.agents/skills/qa-human-testing/SKILL.md)) and automated PR review ([`.agents/skills/pr-review/SKILL.md`](file:///.agents/skills/pr-review/SKILL.md)).
  - Hand off to client engineering leads / stakeholders for review and merge.

---

## Procedure for Internal Repositories (`"ownership": "internal"`)

### 1. Merge PR
1. Verify PR status and automated checks:
   ```bash
   gh pr view <pr_number> --json reviewDecision,statusCheckRollup
   ```
2. Verify domain guard and secret checks pass:
   ```bash
   node scripts/scan-secrets.mjs
   node scripts/domain-guard.mjs --full
   ```
3. Squash and merge the pull request:
   ```bash
   gh pr merge <pr_number> --squash --delete-branch
   ```

### 2. Monitor Post-Merge CD Deployment Pipeline
1. Pull the latest default branch (`main` or `master` per `.agents/backbone.json`) locally:
   ```bash
   git checkout <default_branch>
   git pull origin <default_branch>
   ```
2. Locate the triggered CD workflow run on `<default_branch>` (if CI/CD is configured):
   ```bash
   gh run list --branch <default_branch> -L 1 --json databaseId,status,conclusion,displayTitle
   gh run watch <run_id>
   ```
3. Monitor the deployment run to completion and confirm `conclusion: success`.

### 3. Context-Rot Clean-Up
Once merge and deployment have succeeded:
1. Append an enduring record to [`work/HISTORY.md`](file:///work/HISTORY.md) pointing to the GitHub PR:
   ```markdown
   - **<YYYY-MM-DD>**: `<name_of_the_work>` — [PR #<number>](<pr_url>) (<concise summary of delivered capabilities>)
   ```
2. Remove the completed work folder from the default branch:
   ```bash
   git rm -rf work/<YYYY-MM-DD>_<name_of_the_work>/
   git commit -m "chore(work): archive and remove completed work/<folder> [skip ci]"
   git push origin <default_branch>
   ```
   *(Note: The full PRD, issue breakdown, discussion, and QA guide remain permanently preserved in the GitHub PR and commit history, while keeping the repository tree 100% clean and free of stale context).*

### 4. Verification & Final Report
1. Verify live service/app health if a staging or production URL is configured.
2. Report final completion to the user with links to the PR, deployment run, and `work/HISTORY.md` entry.
