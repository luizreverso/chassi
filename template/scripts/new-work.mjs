#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const rawArgs = process.argv.slice(2);
const noBranchFlag = rawArgs.includes("--no-branch");
const nameArgs = rawArgs.filter(arg => !arg.startsWith("--"));

if (nameArgs.length === 0) {
  console.error("Usage: yarn work:new <name_of_the_work> [--no-branch]");
  console.error("Example: yarn work:new subscription_billing_portal");
  process.exit(1);
}

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const dateStr = `${year}-${month}-${day}`;

const sanitizedName = nameArgs
  .join(" ")
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

if (!sanitizedName) {
  console.error("Error: Work name must contain alphanumeric characters.");
  process.exit(1);
}

const folderName = `${dateStr}_${sanitizedName}`;
const workDir = path.join(rootDir, "work", folderName);
const issuesDir = path.join(workDir, "issues");
const reqFile = path.join(workDir, "requirements.md");

if (!fs.existsSync(issuesDir)) {
  fs.mkdirSync(issuesDir, { recursive: true });
}

if (!fs.existsSync(reqFile)) {
  const title = sanitizedName
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const content = `# Work Specification: ${title}

**Date:** ${dateStr}  
**Status:** In Planning (Step 1)  

## Objective
<!-- High level description of the goal or client request -->

## Client Brief / Raw Request
<!-- Paste the original client brief, issue description, or prompt here -->

## Desired Outcomes & Key Constraints
- 
- 
`;

  fs.writeFileSync(reqFile, content, "utf8");
  console.log(`Created requirements specification at: work/${folderName}/requirements.md`);
} else {
  console.log(`Work folder already exists: work/${folderName}`);
}

if (!noBranchFlag) {
  const branchName = `feat/${dateStr}-${sanitizedName.replace(/_/g, "-")}`;
  try {
    const currentBranch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: rootDir,
      encoding: "utf8"
    }).trim();
    if (currentBranch !== branchName) {
      const branchExists = (() => {
        try {
          execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, {
            cwd: rootDir,
            stdio: "ignore"
          });
          return true;
        } catch {
          return false;
        }
      })();

      if (branchExists) {
        console.log(`Switching to existing git branch: ${branchName}...`);
        execSync(`git checkout ${branchName}`, { cwd: rootDir, stdio: "inherit" });
      } else {
        console.log(`Creating and switching to git branch: ${branchName}...`);
        execSync(`git checkout -b ${branchName}`, { cwd: rootDir, stdio: "inherit" });
      }
    } else {
      console.log(`Already on branch: ${branchName}`);
    }
  } catch (err) {
    console.warn(`Git branch switch warning: ${err.message}`);
  }
}

console.log("\nReady for Step 2! Next run:");
console.log("1. Fill in your requirements in work/" + folderName + "/requirements.md");
console.log('2. Activate the "grill-me" and "write-a-prd" skills with your AI assistant.');
