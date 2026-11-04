#!/usr/bin/env node

/**
 * Agnostic Domain, Ontology & Architecture Guard Script
 * Reads project configuration from .agents/backbone.json and enforces:
 * 1. Workspace / Monorepo app isolation (path-resolved cross-app import blocking)
 * 2. Architectural layer isolation (e.g. no direct DB/backend imports in client code)
 * 3. Zero-drift schema migrations + destructive SQL migration guard (@guardian-approved)
 * 4. Canonical API contract synchronization across workspaces
 * 5. Structural AST rules via ast-grep (.ast-grep/rules/)
 * 6. Deterministic Graphify topology gate (zero import cycles in GRAPH_REPORT.md)
 * 7. Anti-Doc-Rot verification (all file:// links in AGENTS.md and .agents/ exist on disk)
 * 8. Activated Dual-Guardian checklist advisory for modified domain files
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ARGS = process.argv.slice(2);
const IS_CI = ARGS.includes("--ci");
const IS_FULL = ARGS.includes("--full");
const PROJECT_ROOT = process.cwd();

function loadBackboneConfig() {
  const configPath = path.join(PROJECT_ROOT, ".agents", "backbone.json");
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch {
      // fall through to defaults
    }
  }
  return {
    projectName: "project",
    defaultBranch: "main",
    boundaries: {
      workspacesRoot: "apps",
      isolatedApps: [],
      sharedWorkspaces: ["shared", "ui", "design_system"],
      packagePrefix: "@app",
      layerRules: []
    },
    schemas: {
      schemaFile: "",
      migrationDirs: ["drizzle/", "prisma/migrations/", "migrations/"],
      generateCommand: "yarn db:generate",
      canonicalContractFile: ""
    },
    graph: {
      reportPath: "graphify-out/GRAPH_REPORT.md",
      enforceZeroCycles: true
    },
    guardians: []
  };
}

const CONFIG = loadBackboneConfig();
const WORKSPACES_ROOT = CONFIG.boundaries?.workspacesRoot || "apps";
const ISOLATED_APPS = CONFIG.boundaries?.isolatedApps || [];
const SHARED_WORKSPACES = new Set(CONFIG.boundaries?.sharedWorkspaces || ["shared", "ui", "design_system"]);
const PACKAGE_PREFIX = CONFIG.boundaries?.packagePrefix || "@app";

function getTargetFiles() {
  try {
    const defaultBranch = CONFIG.defaultBranch || "main";
    let cmd = "git diff --cached --name-only --diff-filter=ACM";
    if (IS_CI) {
      cmd = `git diff origin/${defaultBranch}...HEAD --name-only --diff-filter=ACM 2>/dev/null || git diff HEAD~1 --name-only --diff-filter=ACM`;
    } else if (IS_FULL) {
      cmd = "git status --porcelain | awk '{print $2}'";
    }
    const output = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const files = output
      .split("\n")
      .map(f => f.trim())
      .filter(Boolean);
    if (files.length === 0 && (IS_FULL || IS_CI)) {
      const headFiles = execSync("git diff HEAD~1 --name-only --diff-filter=ACM", {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"]
      });
      return headFiles
        .split("\n")
        .map(f => f.trim())
        .filter(Boolean);
    }
    return files;
  } catch {
    return [];
  }
}

function checkCrossAppImports(files) {
  const violations = [];
  if (ISOLATED_APPS.length === 0) return violations;

  const sourceRegex = new RegExp(`^${WORKSPACES_ROOT}\\/([a-zA-Z0-9_-]+)\\/.*\\.(ts|tsx|js|jsx)$`);
  const specifierRegex = /(?:from\s+|import\s*\(\s*)['"]([^'"]+)['"]/g;

  for (const file of files) {
    const match = file.match(sourceRegex);
    if (!match) continue;

    const currentApp = match[1];
    if (SHARED_WORKSPACES.has(currentApp)) continue;

    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf8");

    for (const m of content.matchAll(specifierRegex)) {
      const specifier = m[1];
      let targetMatched = null;

      if (specifier.startsWith(".")) {
        const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
        const resolvedAppMatch = resolved.match(
          new RegExp(`^${WORKSPACES_ROOT}\\/([a-zA-Z0-9_-]+)(\\/|$)`)
        );
        if (resolvedAppMatch) {
          const resolvedApp = resolvedAppMatch[1];
          if (
            resolvedApp !== currentApp &&
            !SHARED_WORKSPACES.has(resolvedApp) &&
            ISOLATED_APPS.includes(resolvedApp)
          ) {
            targetMatched = resolvedApp;
          }
        }
      } else {
        for (const targetApp of ISOLATED_APPS) {
          if (targetApp === currentApp) continue;
          if (
            specifier === `${WORKSPACES_ROOT}/${targetApp}` ||
            specifier.startsWith(`${WORKSPACES_ROOT}/${targetApp}/`) ||
            specifier === `${PACKAGE_PREFIX}/${targetApp}` ||
            specifier.startsWith(`${PACKAGE_PREFIX}/${targetApp}/`)
          ) {
            targetMatched = targetApp;
            break;
          }
        }
      }

      if (targetMatched) {
        const line = content.substring(0, m.index).split("\n").length;
        violations.push({
          type: "CROSS_APP_IMPORT",
          file,
          line,
          detail: `Illegal cross-app import '${specifier}' targeting '${targetMatched}' from '${currentApp}'. Use shared packages instead.`
        });
      }
    }
  }
  return violations;
}

function checkAstGrepRules(files) {
  const violations = [];
  const warnings = [];
  const sgConfigPath = path.join(PROJECT_ROOT, "sgconfig.yml");
  if (!fs.existsSync(sgConfigPath)) return { violations, warnings };

  const tsFiles = files.filter(f => /\.(ts|tsx|js|jsx|py|go|rs)$/.test(f) && fs.existsSync(f));
  if (tsFiles.length === 0 && !IS_FULL) return { violations, warnings };

  const env = {
    ...process.env,
    PATH: `${process.env.HOME}/.local/bin:/opt/homebrew/bin:${process.env.PATH || ""}`
  };

  try {
    execSync("command -v ast-grep", { env, stdio: "ignore" });
  } catch {
    return { violations, warnings };
  }

  const parseAstOutput = raw => {
    const results = JSON.parse(raw || "[]");
    for (const r of results) {
      const item = {
        type: `AST_RULE:${r.ruleId}`,
        file: r.file,
        line: (r.range?.start?.line ?? 0) + 1,
        detail: r.message
      };
      if (r.severity === "error") {
        violations.push(item);
      } else {
        warnings.push(item);
      }
    }
  };

  try {
    const targetArgs = IS_FULL ? "" : tsFiles.map(f => `"${f}"`).join(" ");
    const output = execSync(`ast-grep scan --json ${targetArgs}`, {
      cwd: PROJECT_ROOT,
      env,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    parseAstOutput(output);
  } catch (err) {
    if (err.stdout) {
      try {
        parseAstOutput(err.stdout);
      } catch {
        // ignore parse errors
      }
    }
  }

  return { violations, warnings };
}

function checkLayerLeaks(files) {
  const violations = [];
  const layerRules = CONFIG.boundaries?.layerRules || [];

  for (const rule of layerRules) {
    const sourceRegex = new RegExp(rule.sourcePattern);
    const excludes = new Set(rule.excludeFiles || []);
    const tokens = (rule.forbiddenImportTokens || []).map(t =>
      t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    if (tokens.length === 0) continue;
    const leakRegex = new RegExp(`from\\s+['"][^'"]*(${tokens.join("|")})[^'"]*['"]`, "g");

    for (const file of files) {
      if (!sourceRegex.test(file)) continue;
      if (excludes.has(file)) continue;
      if (!fs.existsSync(file)) continue;

      const content = fs.readFileSync(file, "utf8");
      for (const m of content.matchAll(leakRegex)) {
        const line = content.substring(0, m.index).split("\n").length;
        violations.push({
          type: rule.name || "LAYER_LEAK",
          file,
          line,
          detail: rule.message || "Forbidden cross-layer import detected."
        });
      }
    }
  }
  return violations;
}

function checkSchemaMigrationSync(files) {
  const violations = [];
  const schemaFile = CONFIG.schemas?.schemaFile;
  if (!schemaFile) return violations;

  const schemaModified = files.some(f => f === schemaFile || f.endsWith(schemaFile));
  if (schemaModified) {
    const migrationDirs = CONFIG.schemas?.migrationDirs || [];
    const migrationModified = files.some(
      f => migrationDirs.some(dir => f.includes(dir)) || f.endsWith(".sql")
    );

    if (!migrationModified) {
      const genCmd = CONFIG.schemas?.generateCommand || "db:generate";
      violations.push({
        type: "SCHEMA_DRIFT",
        file: schemaFile,
        line: 1,
        detail: `Database schema was modified without a corresponding migration SQL. Run '${genCmd}' to prevent production schema drift.`
      });
    }
  }
  return violations;
}

function checkDestructiveMigrationSql(files) {
  const violations = [];
  const sqlFiles = files.filter(f => f.endsWith(".sql") && fs.existsSync(f));
  const destructiveRegex = /\b(DROP\s+TABLE|DROP\s+COLUMN|TRUNCATE(?:\s+TABLE)?)\b/gi;

  for (const file of sqlFiles) {
    const content = fs.readFileSync(file, "utf8");
    if (/--\s*@guardian-approved:/i.test(content)) continue;

    for (const m of content.matchAll(destructiveRegex)) {
      const line = content.substring(0, m.index).split("\n").length;
      violations.push({
        type: "DESTRUCTIVE_SQL_MIGRATION",
        file,
        line,
        detail: `Destructive SQL ('${m[1]}') detected in migration without '-- @guardian-approved: <reason>' annotation.`
      });
    }
  }
  return violations;
}

function checkOpenApiTypesSync(files) {
  const violations = [];
  const canonicalRel = CONFIG.schemas?.canonicalContractFile;
  if (!canonicalRel || ISOLATED_APPS.length === 0) return violations;

  const contractPattern = new RegExp(`^${WORKSPACES_ROOT}\\/[^/]+\\/app\\/types\\/api\\.ts$`);
  const apiTypeModified = files.some(f => contractPattern.test(f));
  if (!apiTypeModified && !IS_FULL) return violations;

  const canonicalPath = path.join(PROJECT_ROOT, canonicalRel);
  if (!fs.existsSync(canonicalPath)) return violations;
  const canonicalContent = fs.readFileSync(canonicalPath, "utf8");

  for (const app of ISOLATED_APPS) {
    const targetRel = `${WORKSPACES_ROOT}/${app}/app/types/api.ts`;
    const targetPath = path.join(PROJECT_ROOT, targetRel);
    if (!fs.existsSync(targetPath)) continue;
    const content = fs.readFileSync(targetPath, "utf8");
    if (content !== canonicalContent) {
      violations.push({
        type: "OPENAPI_CLIENT_DRIFT",
        file: targetRel,
        line: 1,
        detail: `'${targetRel}' has drifted from canonical '${canonicalRel}'. Keep generated client types synchronized across all workspaces.`
      });
    }
  }
  return violations;
}

function checkGraphTopology() {
  const violations = [];
  if (!CONFIG.graph?.enforceZeroCycles) return violations;

  const reportRel = CONFIG.graph?.reportPath || "graphify-out/GRAPH_REPORT.md";
  const reportPath = path.join(PROJECT_ROOT, reportRel);
  if (!fs.existsSync(reportPath)) return violations;

  const content = fs.readFileSync(reportPath, "utf8");
  const cycleMatch = content.match(/## Import Cycles\s*\n+([^\n#]+)/);
  if (cycleMatch) {
    const cycleLine = cycleMatch[1].trim();
    if (!/none detected/i.test(cycleLine)) {
      const line = content.substring(0, cycleMatch.index).split("\n").length;
      violations.push({
        type: "GRAPH_IMPORT_CYCLE",
        file: reportRel,
        line,
        detail: `Graphify detected circular import cycle(s): ${cycleLine}. Break the cycle before committing.`
      });
    }
  }
  return violations;
}

/**
 * Graphify-inspired Anti-Doc-Rot check (test_architecture_doc pattern):
 * Ensures every file:// link referenced in AGENTS.md, .agents/agents/*.md,
 * and .agents/skills/<skill>/SKILL.md resolves to real code on disk.
 */
function checkDocCodeDrift() {
  const violations = [];
  const docFiles = ["AGENTS.md"];

  const agentsDir = path.join(PROJECT_ROOT, ".agents", "agents");
  if (fs.existsSync(agentsDir)) {
    for (const f of fs.readdirSync(agentsDir)) {
      if (f.endsWith(".md")) {
        docFiles.push(path.join(".agents", "agents", f));
      }
    }
  }

  const skillsDir = path.join(PROJECT_ROOT, ".agents", "skills");
  if (fs.existsSync(skillsDir)) {
    for (const dir of fs.readdirSync(skillsDir)) {
      if (dir === "graphify") continue; // third-party skill bundle
      const skillFile = path.join(".agents", "skills", dir, "SKILL.md");
      if (fs.existsSync(path.join(PROJECT_ROOT, skillFile))) {
        docFiles.push(skillFile);
      }
    }
  }

  for (const docFile of docFiles) {
    const fullDocPath = path.join(PROJECT_ROOT, docFile);
    if (!fs.existsSync(fullDocPath)) continue;
    const content = fs.readFileSync(fullDocPath, "utf8");

    const linkRegex = /\]\(file:\/\/([^)#\s]+)(?:#[^)]*)?\)/g;
    for (const m of content.matchAll(linkRegex)) {
      const rawTarget = m[1];
      if (
        rawTarget.includes("[") ||
        rawTarget.includes("]") ||
        rawTarget.includes("<") ||
        rawTarget.includes(">") ||
        rawTarget.includes("{{") ||
        rawTarget.includes("}}") ||
        rawTarget.includes("/path/to/") ||
        rawTarget.includes("example")
      ) {
        continue;
      }
      let resolvedPath = rawTarget;
      const normalizedRel = rawTarget
        .replace(/^\/Users\/[^/]+\/Projects\/[^/]+\//, "/")
        .replace(/^\/home\/[^/]+\/projects\/[^/]+\//, "/")
        .replace(/^\/home\/runner\/work\/[^/]+\/[^/]+\//, "/");
      if (!normalizedRel.startsWith(PROJECT_ROOT) && normalizedRel.startsWith("/")) {
        resolvedPath = path.join(PROJECT_ROOT, normalizedRel.slice(1));
      }
      if (!fs.existsSync(resolvedPath) && !fs.existsSync(rawTarget)) {
        const line = content.substring(0, m.index).split("\n").length;
        violations.push({
          type: "DOC_LINK_DRIFT",
          file: docFile,
          line,
          detail: `Broken file link in agent/workflow specification: '${rawTarget}' does not exist on disk.`
        });
      }
    }
  }

  return violations;
}

function getActivatedGuardians(files) {
  if (files.length === 0) return [];
  const guardians = CONFIG.guardians || [];
  const activated = [];

  for (const g of guardians) {
    const triggers = g.triggers || [];
    const matched = files.some(f => triggers.some(t => f.toLowerCase().includes(t.toLowerCase())));
    if (matched) {
      activated.push(g);
    }
  }
  return activated;
}

function run() {
  const files = getTargetFiles();
  const docViolations = checkDocCodeDrift();
  const graphViolations = checkGraphTopology();
  const astResults = checkAstGrepRules(files);

  const codeViolations =
    files.length > 0
      ? [
          ...checkCrossAppImports(files),
          ...checkLayerLeaks(files),
          ...checkSchemaMigrationSync(files),
          ...checkDestructiveMigrationSql(files),
          ...checkOpenApiTypesSync(files),
          ...astResults.violations
        ]
      : [...checkOpenApiTypesSync([]), ...astResults.violations];

  const violations = [...docViolations, ...graphViolations, ...codeViolations];

  const activatedGuardians = getActivatedGuardians(files);
  if (activatedGuardians.length > 0) {
    console.log(
      `\x1b[36mℹ [Dual-Guardian Active Scope]\x1b[0m ${activatedGuardians
        .map(g => `${g.label} (${path.basename(g.ontologyAgent)} × ${path.basename(g.businessAgent)})`)
        .join(", ")}`
    );
  }

  if (astResults.warnings.length > 0) {
    console.warn(
      `\n\x1b[33m⚠ [Dual-Guardian AST Advisory]\x1b[0m ${astResults.warnings.length} warning(s) detected by ast-grep:`
    );
    for (const w of astResults.warnings) {
      console.warn(`  \x1b[33m${w.file}:${w.line}\x1b[0m [${w.type}] ${w.detail}`);
    }
  }

  if (violations.length === 0) {
    console.log(
      "\x1b[32m✔ [Domain & Architecture Guard]\x1b[0m All domain boundaries, AST rules, graph topology, doc links, and schema migrations verified clean."
    );
    process.exit(0);
  }

  console.error(
    `\n\x1b[31m✖ [Domain Guard Error]\x1b[0m Detected ${violations.length} boundary, AST, graph, schema, or doc-drift violation(s):\n`
  );
  for (const v of violations) {
    console.error(`  \x1b[33m${v.file}:${v.line}\x1b[0m [\x1b[31m${v.type}\x1b[0m]`);
    console.error(`  ${v.detail}\n`);
  }

  console.error(
    "\x1b[36mTip:\x1b[0m Consult the relevant Domain Dual Guardians (.agents/agents/) to resolve these violations.\n"
  );
  process.exit(1);
}

run();
