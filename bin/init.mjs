#!/usr/bin/env node

/**
 * Agentic Backbone Installer CLI
 * Usage:
 *   node bin/init.mjs <target-directory> [--name <project-name>] [--branch <default-branch>] [--force]
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.resolve(__dirname, "..", "template");

const args = process.argv.slice(2);
const force = args.includes("--force");

function getFlagValue(flag) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return null;
}

const nameOverride = getFlagValue("--name");
const branchOverride = getFlagValue("--branch");

const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--name" || args[i] === "--branch") {
    i++;
    continue;
  }
  if (!args[i].startsWith("--")) {
    positional.push(args[i]);
  }
}

if (positional.length === 0) {
  console.error("Usage: node bin/init.mjs <target-directory> [--name <project-name>] [--branch <default-branch>] [--force]");
  process.exit(1);
}

const targetDir = path.resolve(process.cwd(), positional[0]);
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const projectName = nameOverride || path.basename(targetDir);

function detectDefaultBranch(dir) {
  if (branchOverride) return branchOverride;
  try {
    const branch = execSync("git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null || git branch --show-current 2>/dev/null", {
      cwd: dir,
      encoding: "utf8"
    })
      .trim()
      .replace(/^refs\/remotes\/origin\//, "");
    return branch || "main";
  } catch {
    return "main";
  }
}

const defaultBranch = detectDefaultBranch(targetDir);

const copied = [];
const skipped = [];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }

  const relDest = path.relative(targetDir, dest);
  if (fs.existsSync(dest) && !force) {
    skipped.push(relDest);
    return;
  }

  fs.copyFileSync(src, dest);
  if (dest.endsWith(".mjs") || dest.endsWith(".sh") || dest.includes(`${path.sep}.husky${path.sep}`)) {
    fs.chmodSync(dest, 0o755);
  }
  copied.push(relDest);
}

copyRecursive(TEMPLATE_DIR, targetDir);

// Customize .agents/backbone.json with detected projectName and defaultBranch
const backboneConfigPath = path.join(targetDir, ".agents", "backbone.json");
if (fs.existsSync(backboneConfigPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(backboneConfigPath, "utf8"));
    config.projectName = projectName;
    config.defaultBranch = defaultBranch;
    fs.writeFileSync(backboneConfigPath, JSON.stringify(config, null, 2) + "\n", "utf8");
  } catch {
    // ignore JSON customization errors
  }
}

// Customize templates/design.md with detected projectName
const designDocPath = path.join(targetDir, "templates", "design.md");
if (fs.existsSync(designDocPath)) {
  try {
    let designContent = fs.readFileSync(designDocPath, "utf8");
    designContent = designContent.replaceAll("{{PROJECT_NAME}}", projectName);
    fs.writeFileSync(designDocPath, designContent, "utf8");
  } catch {
    // ignore
  }
}

// Ensure multi-IDE agent discovery bindings (Antigravity, AGY, Cursor)
function ensureSymlink(linkPath, relativeTarget) {
  try {
    const parentDir = path.dirname(linkPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    if (fs.existsSync(linkPath)) {
      if (force) {
        fs.rmSync(linkPath, { recursive: true, force: true });
      } else {
        return;
      }
    }
    fs.symlinkSync(relativeTarget, linkPath);
  } catch {
    try {
      const resolvedTarget = path.resolve(path.dirname(linkPath), relativeTarget);
      if (fs.existsSync(resolvedTarget)) {
        copyRecursive(resolvedTarget, linkPath);
      }
    } catch {
      // ignore fallback errors
    }
  }
}

ensureSymlink(path.join(targetDir, ".antigravity", "skills"), path.join("..", ".agents", "skills"));
ensureSymlink(path.join(targetDir, ".antigravity", "rules"), path.join("..", ".agents", "agents"));
ensureSymlink(path.join(targetDir, ".agent", "skills"), path.join("..", ".agents", "skills"));
ensureSymlink(path.join(targetDir, ".agent", "rules"), path.join("..", ".agents", "agents"));
ensureSymlink(path.join(targetDir, ".cursor", "agents"), path.join("..", ".agents", "agents"));

// Merge backbone scripts into target package.json if present (or create a minimal one)
const pkgPath = path.join(targetDir, "package.json");
const BACKBONE_SCRIPTS = {
  "decide": "node scripts/decide.mjs",
  "work:new": "node scripts/new-work.mjs",
  "guard:domain": "node scripts/domain-guard.mjs",
  "guard:secrets": "node scripts/scan-secrets.mjs",
  "ast:scan": "PATH=\"$HOME/.local/bin:$PATH\" ast-grep scan",
  "ast:test": "PATH=\"$HOME/.local/bin:$PATH\" ast-grep test --skip-snapshot-tests",
  "estimate": "python3 .agents/skills/scoping-estimation/estimate-calc.py --sample",
  "cbm:index": "echo '{\"repo_path\":\".\"}' | PATH=\"$HOME/.local/bin:$PATH\" codebase-memory-mcp cli index_repository",
  "graph:build": "rm -rf graphify-out && PATH=\"$HOME/.local/bin:$PATH\" graphify extract . --code-only && PATH=\"$HOME/.local/bin:$PATH\" GRAPHIFY_BACKEND=none graphify cluster-only .",
  "graph:update": "PATH=\"$HOME/.local/bin:$PATH\" graphify update . && PATH=\"$HOME/.local/bin:$PATH\" GRAPHIFY_BACKEND=none graphify cluster-only .",
  "graph:query": "PATH=\"$HOME/.local/bin:$PATH\" graphify query",
  "graph:path": "PATH=\"$HOME/.local/bin:$PATH\" graphify path",
  "graph:explain": "PATH=\"$HOME/.local/bin:$PATH\" graphify explain"
};

if (fs.existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.scripts = pkg.scripts || {};
    let addedScripts = 0;
    for (const [k, v] of Object.entries(BACKBONE_SCRIPTS)) {
      if (!pkg.scripts[k] || force) {
        pkg.scripts[k] = v;
        addedScripts++;
      }
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
    console.log(`✔ Updated package.json with ${addedScripts} chassi script(s).`);
  } catch (err) {
    console.warn(`⚠ Could not update target package.json: ${err.message}`);
  }
} else {
  const newPkg = {
    name: projectName,
    private: true,
    scripts: BACKBONE_SCRIPTS
  };
  fs.writeFileSync(pkgPath, JSON.stringify(newPkg, null, 2) + "\n", "utf8");
  copied.push("package.json");
}

console.log(`\n\x1b[32m✔ Chassi installed in:\x1b[0m ${targetDir}`);
console.log(`  • Project Name:   ${projectName}`);
console.log(`  • Default Branch: ${defaultBranch}`);
console.log(`  • Multi-IDE:      Google Antigravity, Cursor, Claude Code & universal AGENTS.md configured`);
console.log(`  • Files written:  ${copied.length}`);
if (skipped.length > 0) {
  console.log(`  • Files skipped:  ${skipped.length} (already existed; pass --force to overwrite)`);
}
console.log(`\n\x1b[36mNext Steps:\x1b[0m`);
console.log(`  1. cd ${targetDir}`);
console.log(`  2. Run 'yarn graph:build' and 'yarn cbm:index' (if code already exists)`);
console.log(`  3. Ask your AI agent to run the 'bootstrap-guardians' skill to configure .agents/backbone.json and generate your Dual-Guardian pairs.`);
console.log(`  4. Verify with 'make test' (or 'yarn ast:test && yarn guard:domain --full')\n`);
