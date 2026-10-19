#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PATTERNS = {
  "Stripe Secret Key": /sk_(test|live)_[a-zA-Z0-9]{24,}/g,
  "Resend API Key": /re_[a-zA-Z0-9]{24,}/g,
  "Private Key": /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  "AWS Secret Access Key": /(AWS_SECRET_ACCESS_KEY|aws_secret_access_key)\s*[:=]\s*['"]?[a-zA-Z0-9/+=]{40}['"]?/g,
  "GitHub Token": /gh[pousr]_[A-Za-z0-9_]{36,}/g
};

const EXCLUDED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".ico",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".lock"
]);

function getStagedFiles() {
  try {
    const output = execSync("git diff --cached --name-only --diff-filter=ACM", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return output
      .split("\n")
      .map(f => f.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function scanFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (EXCLUDED_EXTENSIONS.has(ext)) return false;

  try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) return false;
    if (stats.size > 2 * 1024 * 1024) return false;

    const content = fs.readFileSync(filePath, "utf8");
    let hasSecret = false;

    for (const [name, regex] of Object.entries(PATTERNS)) {
      regex.lastIndex = 0;
      const matches = content.matchAll(regex);
      for (const match of matches) {
        const index = match.index || 0;
        const lineNum = content.substring(0, index).split("\n").length;

        console.error(
          `\x1b[31m[SECURITY ERROR]\x1b[0m Potential ${name} detected in file: \x1b[33m${filePath}\x1b[0m on line \x1b[32m${lineNum}\x1b[0m`
        );
        hasSecret = true;
      }
    }

    return hasSecret;
  } catch {
    return false;
  }
}

function main() {
  const files = getStagedFiles();
  let foundViolations = false;

  for (const file of files) {
    if (fs.existsSync(file) && scanFile(file)) {
      foundViolations = true;
    }
  }

  if (foundViolations) {
    console.error(
      "\x1b[31m\x1b[1m[COMMIT BLOCKED]\x1b[0m Secret scanning failed. Please remove the secrets listed above before committing."
    );
    process.exit(1);
  }
  process.exit(0);
}

main();
