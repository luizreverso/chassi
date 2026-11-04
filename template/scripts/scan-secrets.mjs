#!/usr/bin/env node

/**
 * Zero Plaintext Secrets Pre-Commit & Workspace Scanner
 * Enforces strict reference standards (1Password 'op://...' references or environment variables)
 * across the repository and prevents accidental secret leaks.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ARGS = process.argv.slice(2);
const IS_FULL = ARGS.includes("--full");
const TARGET_DIR_INDEX = ARGS.indexOf("--dir");
const TARGET_ROOT =
  TARGET_DIR_INDEX !== -1 && ARGS[TARGET_DIR_INDEX + 1]
    ? path.resolve(ARGS[TARGET_DIR_INDEX + 1])
    : process.cwd();

const PATTERNS = {
  "Stripe Secret Key": /sk_(test|live)_[a-zA-Z0-9]{24,}/g,
  "Resend API Key": /re_[a-zA-Z0-9]{24,}/g,
  "Private Key": /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  "AWS Secret Access Key":
    /(AWS_SECRET_ACCESS_KEY|aws_secret_access_key)\s*[:=]\s*['"]?[a-zA-Z0-9/+=]{40}['"]?/g,
  "Slack Bot/User Token": /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*/g,
  "GitHub Personal Access Token": /gh[pousr]_[A-Za-z0-9_]{36,255}/g,
  "OpenAI API Key": /sk-(?:proj-)?[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}/g,
  "Google / Gemini API Key": /AIza[0-9A-Za-z_-]{35}/g
};

const EXCLUDED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".lock",
  ".woff",
  ".woff2",
  ".ttf"
]);

function getFilesToScan(cwd) {
  try {
    const cmd = IS_FULL
      ? "git ls-files"
      : "git diff --cached --name-only --diff-filter=ACM";
    const output = execSync(cmd, { cwd, encoding: "utf8" });
    return output
      .split("\n")
      .map(f => f.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function scanFile(cwd, relPath) {
  const fullPath = path.join(cwd, relPath);
  const ext = path.extname(relPath).toLowerCase();
  if (EXCLUDED_EXTENSIONS.has(ext)) return false;

  // Skip self
  if (relPath.endsWith("scripts/scan-secrets.mjs")) return false;

  try {
    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) return false;
    if (stats.size > 2 * 1024 * 1024) return false;

    const content = fs.readFileSync(fullPath, "utf8");
    let hasSecret = false;

    for (const [name, regex] of Object.entries(PATTERNS)) {
      regex.lastIndex = 0;
      const match = regex.exec(content);
      if (match) {
        const index = match.index;
        const lineNum = content.substring(0, index).split("\n").length;

        console.error(
          `\x1b[31m[SECURITY ERROR]\x1b[0m Potential ${name} detected in file: \x1b[33m${relPath}\x1b[0m on line \x1b[32m${lineNum}\x1b[0m`
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
  const files = getFilesToScan(TARGET_ROOT);
  let foundViolations = false;

  for (const file of files) {
    if (fs.existsSync(path.join(TARGET_ROOT, file))) {
      if (scanFile(TARGET_ROOT, file)) {
        foundViolations = true;
      }
    }
  }

  if (foundViolations) {
    console.error(
      "\x1b[31m\x1b[1m[COMMIT BLOCKED]\x1b[0m Secret scanning failed. Reference environment variables or 1Password ('op://...') instead."
    );
    process.exit(1);
  } else {
    console.log(
      `\x1b[32m✔ [Secret Guard]\x1b[0m Zero plaintext secrets detected (${files.length} file(s) checked).`
    );
    process.exit(0);
  }
}

main();
