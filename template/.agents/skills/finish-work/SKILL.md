---
name: finish-work
description: Conclude a finished work item by merging the PR via gh, monitoring the post-merge CD deployment pipeline on the default branch to completion, and cleaning up the completed work folder to prevent context rot. Use when all issues, tests, and QA sign-offs for a work item are complete.
---

# Finish Work: Merge, CD Monitoring & Context-Rot Cleanup

This skill defines **Step 6** of the development workflow.

## Purpose
After all vertical slice issues are implemented via TDD and the human QA guide is approved, this skill executes the final delivery: merging the PR, tracking the live deployment pipeline on the default branch (configured in [`.agents/backbone.json`](file:///.agents/backbone.json)), and cleaning up the temporary work folder so the repository never suffers from context rot.

## Procedure

### 1. Merge PR
1. Verify PR status and reviews:
   ```bash
   gh pr view <pr_number> --json reviewDecision,statusCheckRollup
   ```
2. Squash and merge the pull request:
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
   gh run list --branch <default_branch> -L 1 --json databaseId,status,displayTitle
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
