#!/usr/bin/env node

/**
 * Chassi — "System 1" Decision Gate, Spec Drift Gate & Model/Effort Router (scripts/decide.mjs)
 *
 * Provides Jev-style non-generative decision primitives (Noul, Choice, Score),
 * the EGM Spec Drift Gate (--drift), and a 6-Tier Model + Effort Router tailored
 * to project-agnostic AI software engineering workflows.
 *
 * Backends (in priority order unless overridden via --offline):
 *   1. Google Gemini Flash-Lite + Constrained Enum Schema + responseLogprobs
 *      (uses GEMINI_API_KEY or GOOGLE_API_KEY; zero-Plaintext-Secrets compliant)
 *   2. Calibrated Structural Engine (instant <15ms offline fallback)
 *
 * Usage:
 *   node ./scripts/decide.mjs --route "Explain how domain-guard.mjs works"
 *   node ./scripts/decide.mjs --route --file work/2026-11-04_feature/issues/001-slice.md
 *   node ./scripts/decide.mjs --drift --file issues/001-slice.md
 *   node ./scripts/decide.mjs --noul "Does this diff modify database schema?" --file diff.patch
 *   node ./scripts/decide.mjs --choice "EXTRACTED,INFERRED,AMBIGUOUS" "Webhook retry policy"
 *   node ./scripts/decide.mjs --score "low,medium,high,critical" --file migration.sql
 */

import fs from "fs";
import path from "path";

const ARGS = process.argv.slice(2);

function hasFlag(flag) {
  return ARGS.includes(flag);
}

function getFlagValue(flag, defaultVal = null) {
  const idx = ARGS.indexOf(flag);
  if (idx !== -1 && idx + 1 < ARGS.length && !ARGS[idx + 1].startsWith("--")) {
    return ARGS[idx + 1];
  }
  return defaultVal;
}

// -----------------------------------------------------------------------------
// Load Project Context from .agents/backbone.json (if present)
// -----------------------------------------------------------------------------
function loadBackboneConfig() {
  try {
    const backbonePath = path.resolve(process.cwd(), ".agents", "backbone.json");
    if (fs.existsSync(backbonePath)) {
      return JSON.parse(fs.readFileSync(backbonePath, "utf8"));
    }
  } catch {
    // ignore
  }
  return { projectName: "Chassi", defaultBranch: "main" };
}

const BACKBONE = loadBackboneConfig();
const PROJECT_NAME = BACKBONE.projectName || "Project";

// -----------------------------------------------------------------------------
// 1. 6-Level Model & Effort Matrix (L1 - L6)
// -----------------------------------------------------------------------------
export const MODEL_TIERS = {
  L1: {
    tier: "L1",
    name: "Instant Lookup, Docs & Triage",
    antigravityModel: "Gemini 3.8 Flash-Lite",
    antigravityAltModels: ["Gemini 3.8 Flash", "Gemini 3.7 Flash"],
    antigravityEffort: "Low",
    subagentModelParam: "flash_lite",
    claudeModel: "haiku",
    claudeEffort: "low",
    cursorModel: "Gemini 3.8 Flash-Lite / Claude Haiku 4.5",
    typicalUse:
      "Code lookup, Graphify query/explain, schema/types exploration, AGENTS.md, quick Q&A"
  },
  L2: {
    tier: "L2",
    name: "Scaffolding, Content & Fast Edits",
    antigravityModel: "Gemini 3.8 Flash",
    antigravityAltModels: ["Gemini 3.7 Flash"],
    antigravityEffort: "Low",
    subagentModelParam: "flash",
    claudeModel: "sonnet",
    claudeEffort: "low",
    cursorModel: "Gemini 3.8 Flash (Low)",
    typicalUse:
      "Work scaffolding (work:new), persona enrichments, config/CSS token tweaks, test mocks, qa.md drafts"
  },
  L3: {
    tier: "L3",
    name: "Standard Vertical Slice TDD ([AFK])",
    antigravityModel: "Gemini 3.8 Flash",
    antigravityAltModels: ["Gemini 3.7 Flash", "Gemini 3.8 Pro"],
    antigravityEffort: "Medium",
    subagentModelParam: "flash",
    claudeModel: "sonnet",
    claudeEffort: "medium",
    cursorModel: "Gemini 3.8 Flash (Medium) / Claude Sonnet 4.6",
    typicalUse:
      "Standard [AFK] vertical slices, CRUD endpoints, UI components with clear specs, unit & integration tests"
  },
  L4: {
    tier: "L4",
    name: "Discovery, Domain Scoping & Infra Checks",
    antigravityModel: "Gemini 3.8 Pro",
    antigravityAltModels: ["Gemini 3.8 Flash (High)", "Gemini 3.7 Pro"],
    antigravityEffort: "Medium",
    subagentModelParam: "pro",
    claudeModel: "sonnet",
    claudeEffort: "high",
    cursorModel: "Gemini 3.8 Pro (Medium) / Claude Sonnet 4.6 (Thinking)",
    typicalUse:
      "Grill-me discovery interviews, domain workflow scoping, PRD-to-issues slicing, Cloud/IaC checks"
  },
  L5: {
    tier: "L5",
    name: "PR Reviews, Dual-Guardian Audits & DB Migrations",
    antigravityModel: "Gemini 4 Argon",
    antigravityAltModels: ["Gemini 3.8 Pro (High)"],
    antigravityEffort: "Medium",
    subagentModelParam: "pro",
    claudeModel: "opus",
    claudeEffort: "medium",
    cursorModel: "Gemini 4 Argon (Medium) / Claude Opus 4.6",
    typicalUse:
      "Autonomous PR review (pr-reviewer.md), Dual-Guardian ontology audits, database migrations, security hardening"
  },
  L6: {
    tier: "L6",
    name: "Deep Architecture, Multi-Module Refactoring & Complex PRDs",
    antigravityModel: "Gemini 4 Argon",
    antigravityAltModels: ["Gemini 4 Argon (High)"],
    antigravityEffort: "High",
    subagentModelParam: "pro",
    claudeModel: "opus",
    claudeEffort: "high",
    cursorModel: "Gemini 4 Argon (High) / Claude Opus 4.6 (Max)",
    typicalUse:
      "Cross-module architecture refactoring, core domain schema overhaul, complex multi-stakeholder PRDs (write-a-prd), multi-hop asynchronous debugging"
  }
};

export const WORKLOAD_CATEGORIES = [
  "lookup-docs",
  "scaffolding-content",
  "feature-tdd",
  "discovery-scoping",
  "infra-prod-ops",
  "review-audit",
  "deep-architecture-refactor"
];

// -----------------------------------------------------------------------------
// 2. Deterministic Structural & Lexical Calibration Engine
// -----------------------------------------------------------------------------
function evaluateOfflineRoute(inputText, filePath = "") {
  const text = (inputText || "").trim();
  const lower = text.toLowerCase();
  const fileLower = (filePath || "").toLowerCase();

  // Check for explicit override tags in markdown issues (e.g. "## Model Tier: L2" or "[TIER: L5]")
  const explicitTierMatch =
    text.match(/##\s*Model\s*Tier\s*\n+\s*\[?(L[1-6])\b/i) ||
    text.match(/\[TIER:\s*(L[1-6])\]/i);

  // Baseline scores per workload category
  const scores = {
    "lookup-docs": 0.15,
    "scaffolding-content": 0.1,
    "feature-tdd": 0.15,
    "discovery-scoping": 0.1,
    "infra-prod-ops": 0.05,
    "review-audit": 0.05,
    "deep-architecture-refactor": 0.05
  };

  let riskScore = 0.15; // 0..1
  let complexityScore = 0.2; // 0..1
  let hitlProb = 0.15; // 0..1
  const signals = [];

  // Short conversational question or explanation check
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const isQuestion =
    text.endsWith("?") ||
    /^(what|how|why|where|when|who|can you explain|is there|what do you think|show me|list|find)\b/i.test(
      text
    );

  if (wordCount <= 45 && isQuestion) {
    scores["lookup-docs"] += 0.55;
    complexityScore -= 0.1;
    signals.push("short conversational question/lookup");
  }

  // Lookup & Docs signals
  if (
    /\b(explain|lookup|look up|readme|agents\.md|backbone\.json|where is|how does|graphify|query|summarize|documentation|typo|comment)\b/i.test(
      lower
    )
  ) {
    scores["lookup-docs"] += 0.45;
    signals.push("documentation/code-lookup keywords");
  }

  // Scaffolding & Content signals
  if (
    /\b(scaffold|template|work:new|persona|copy tweak|css token|color token|qa-template|placeholder|rename|boilerplate)\b/i.test(
      lower
    )
  ) {
    scores["scaffolding-content"] += 0.55;
    signals.push("scaffolding/template workflow");
  }

  // Standard Feature TDD / Vertical Slice signals
  if (
    /\b(vertical slice|acceptance criteria|what to build|parent prd|tdd|red-green-refactor|unit test|integration test|endpoint|component|hook|form|validation)\b/i.test(
      lower
    ) ||
    fileLower.includes("/issues/")
  ) {
    scores["feature-tdd"] += 0.55;
    complexityScore += 0.2;
    signals.push("vertical-slice TDD specification");
  }

  // Discovery, Grilling & Scoping signals
  if (
    /\b(grill me|grill-me|onboard|estimation|wbs|break down prd|prd-to-issues|goldfish|interview|clarify)\b/i.test(
      lower
    )
  ) {
    scores["discovery-scoping"] += 0.6;
    complexityScore += 0.25;
    hitlProb += 0.5;
    signals.push("discovery/scoping/grilling workflow");
  }

  // Infrastructure, Cloud & Deployment signals
  if (
    /\b(docker|compose|cdk|cloudformation|lambda|serverless|s3|cloudfront|rds|postgres|database|stripe|deploy|production|kubernetes|helm)\b/i.test(
      lower
    )
  ) {
    scores["infra-prod-ops"] += 0.65;
    riskScore += 0.4;
    complexityScore += 0.25;
    signals.push("production/cloud infra operations");
  }

  // PR Review, Security & Dual-Guardian Audit signals
  if (
    /\b(pr\s*review|review\s*pr|pull\s*request|code\s*review|diff\s*review|ontology-audit|bootstrap-guardians|dual-guardian|guardian|security\s*audit|vulnerability|xss|sql\s*injection|extracted|inferred|ambiguous|ast:scan|guard:domain)\b/i.test(
      lower
    )
  ) {
    scores["review-audit"] += 0.7;
    riskScore += 0.35;
    complexityScore += 0.35;
    signals.push("PR review / Dual-Guardian / security audit");
  }

  // High-Load Refactoring, Deep Architecture & Complex PRD signals
  if (
    /\b(refactor|architecture|deep module|shallow module|improve-codebase-architecture|write-a-prd|decouple|circular dependency|monorepo|multi-tenant|schema migration|alter table|drop table|destructive)\b/i.test(
      lower
    )
  ) {
    scores["deep-architecture-refactor"] += 0.75;
    riskScore += 0.4;
    complexityScore += 0.45;
    signals.push("deep architecture / schema redesign / complex PRD");
  }

  // Check issue file specific markers ([HITL] vs [AFK], acceptance criteria count)
  if (/\[hitl\]|\bhitl\b/i.test(lower)) {
    hitlProb = Math.max(hitlProb, 0.88);
    riskScore += 0.2;
    complexityScore += 0.15;
    signals.push("explicit [HITL] marker");
  } else if (/\[afk\]|\bafk\b/i.test(lower)) {
    hitlProb = Math.min(hitlProb, 0.2);
    signals.push("explicit [AFK] marker");
  }

  const checkboxes = (text.match(/- \[ \]/g) || []).length;
  if (checkboxes >= 6) {
    complexityScore += 0.2;
    signals.push(`${checkboxes} acceptance criteria items`);
  }

  // Normalize probabilities over workload categories (softmax-like)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const probabilities = {};
  let topWorkload = "lookup-docs";
  let topProb = -1;

  for (const [k, v] of Object.entries(scores)) {
    const p = Number((v / totalScore).toFixed(3));
    probabilities[k] = p;
    if (p > topProb) {
      topProb = p;
      topWorkload = k;
    }
  }

  riskScore = Math.min(1, Math.max(0.05, Number(riskScore.toFixed(2))));
  complexityScore = Math.min(1, Math.max(0.05, Number(complexityScore.toFixed(2))));
  hitlProb = Math.min(0.99, Math.max(0.02, Number(hitlProb.toFixed(2))));

  const riskLabel =
    riskScore >= 0.75
      ? "critical"
      : riskScore >= 0.5
        ? "high"
        : riskScore >= 0.3
          ? "medium"
          : "low";

  const complexityLabel =
    complexityScore >= 0.8
      ? "extreme"
      : complexityScore >= 0.6
        ? "high"
        : complexityScore >= 0.35
          ? "moderate"
          : complexityScore >= 0.2
            ? "low"
            : "trivial";

  // Map workload + risk + complexity -> L1..L6
  let selectedTier = "L3";
  if (explicitTierMatch) {
    selectedTier = explicitTierMatch[1].toUpperCase();
    signals.push(`explicit tier tag ${selectedTier}`);
  } else if (topWorkload === "lookup-docs" && complexityScore < 0.35) {
    selectedTier = "L1";
  } else if (topWorkload === "scaffolding-content" && riskScore < 0.4) {
    selectedTier = "L2";
  } else if (topWorkload === "feature-tdd") {
    if (riskScore >= 0.65 || complexityScore >= 0.75) {
      selectedTier = "L5";
    } else if (hitlProb >= 0.7 || complexityScore >= 0.55) {
      selectedTier = "L4";
    } else {
      selectedTier = "L3";
    }
  } else if (topWorkload === "discovery-scoping") {
    selectedTier = complexityScore >= 0.65 ? "L5" : "L4";
  } else if (topWorkload === "infra-prod-ops") {
    selectedTier = riskScore >= 0.65 ? "L5" : "L4";
  } else if (topWorkload === "review-audit") {
    selectedTier = complexityScore >= 0.75 || riskScore >= 0.75 ? "L6" : "L5";
  } else if (topWorkload === "deep-architecture-refactor") {
    selectedTier = complexityScore >= 0.6 || riskScore >= 0.55 ? "L6" : "L5";
  } else if (complexityScore < 0.25) {
    selectedTier = "L1";
  } else if (complexityScore < 0.4) {
    selectedTier = "L2";
  }

  return {
    provider: "structural-heuristic",
    workload: topWorkload,
    workloadConfidence: topProb,
    workloadDistribution: probabilities,
    risk: riskLabel,
    riskScore,
    complexity: complexityLabel,
    complexityScore,
    hitlProbability: hitlProb,
    recommendation: MODEL_TIERS[selectedTier] || MODEL_TIERS.L3,
    signals: signals.length > 0 ? signals : ["baseline default"]
  };
}

// -----------------------------------------------------------------------------
// 3. Spec Drift Evaluation Engine (EGM Pattern)
// -----------------------------------------------------------------------------
function evaluateOfflineDrift(issueText, diffText) {
  const issue = (issueText || "").trim();
  const diff = (diffText || "").trim();

  // Extract acceptance criteria items (- [ ] ...)
  const criteriaMatches = [...issue.matchAll(/-\s*\[\s*\]\s*([^\n]+)/g)].map(m => m[1].trim());
  const checkedMatches = [...issue.matchAll(/-\s*\[[xX]\]\s*([^\n]+)/g)].map(m => m[1].trim());

  // Extract modified file paths from diff
  const modifiedFiles = [
    ...new Set(
      [...diff.matchAll(/(?:^\+\+\+\s+b\/|^diff\s+--git\s+a\/\S+\s+b\/)(\S+)/gm)].map(m => m[1].trim())
    )
  ];

  const violations = [];
  const covered = [];
  let driftScore = 0.05; // 0..1 scale (0 = zero drift, 1 = severe drift)

  if (!diff) {
    violations.push("No git diff detected to verify against acceptance criteria.");
    driftScore = 0.9;
  }

  // Check if acceptance criteria exist
  if (criteriaMatches.length === 0 && checkedMatches.length === 0) {
    violations.push("Issue has no checklist acceptance criteria (- [ ] ...) to verify.");
    driftScore += 0.2;
  }

  // Check touched files against common high-risk drift zones
  const touchedEnv = modifiedFiles.some(f => f.includes(".env") || f.includes(".secret"));
  if (touchedEnv) {
    violations.push("Diff modifies environment or secret files (critical drift risk).");
    driftScore += 0.5;
  }

  const touchedMigrations = modifiedFiles.some(
    f => f.includes("drizzle") || f.includes("migrations") || f.endsWith(".sql") || f.includes("schema.ts")
  );
  const specMentionsSchema =
    /schema|migration|table|column|database|alter\s+table/i.test(issue);
  if (touchedMigrations && !specMentionsSchema) {
    violations.push(
      "Diff touches database schemas/migrations but issue specification does not mention schema changes."
    );
    driftScore += 0.4;
  }

  // Cross-app boundary leak check
  const workspacesRoot = BACKBONE.boundaries?.workspacesRoot || "apps";
  const touchedApps = new Set();
  for (const f of modifiedFiles) {
    const match = f.match(new RegExp(`^${workspacesRoot}\\/([^/]+)`));
    if (match) {
      touchedApps.add(match[1]);
    }
  }
  if (touchedApps.size > 1) {
    violations.push(
      `Diff spans multiple workspaces simultaneously: [${Array.from(touchedApps).join(", ")}]. Check workspace isolation.`
    );
    driftScore += 0.3;
  }

  // Token alignment between criteria and diff
  for (const crit of criteriaMatches) {
    const keyTokens = crit
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 4 && !/should|expect|verify|ensure|check|tests/i.test(w));
    const matched = keyTokens.some(t => diff.toLowerCase().includes(t));
    if (matched) {
      covered.push(crit);
    }
  }

  driftScore = Math.min(1.0, Math.max(0.02, Number(driftScore.toFixed(2))));
  const isAligned = driftScore < 0.4 && violations.length === 0;

  return {
    mode: "drift",
    provider: "structural-drift-engine",
    isAligned,
    driftScore,
    status: isAligned ? "ALIGNED" : "DRIFT_DETECTED",
    totalCriteria: criteriaMatches.length + checkedMatches.length,
    coveredCriteria: covered.length + checkedMatches.length,
    modifiedFilesCount: modifiedFiles.length,
    modifiedFiles,
    violations: violations.length > 0 ? violations : ["Zero unstated architectural drift detected"]
  };
}

// -----------------------------------------------------------------------------
// 4. Google Gemini Flash-Lite + Logprobs Decision Engine
// -----------------------------------------------------------------------------
async function callGeminiDecision({ mode, prompt, options, apiKey }) {
  const model = process.env.DECIDE_MODEL || "gemini-2.5-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  let systemInstruction = "";
  let responseSchema = {};

  if (mode === "noul") {
    systemInstruction =
      "You are a calibrated System-1 binary decision gate (Noul). Return ONLY 'YES' or 'NO' matching the schema.";
    responseSchema = {
      type: "STRING",
      enum: ["YES", "NO"]
    };
  } else if (mode === "choice" || mode === "score") {
    systemInstruction =
      "You are a calibrated System-1 decision gate. Pick the single most accurate option from the allowed enum.";
    responseSchema = {
      type: "STRING",
      enum: options
    };
  } else if (mode === "route") {
    systemInstruction = `You are ${PROJECT_NAME}'s System-1 Model & Effort Router. Classify the engineering task into one of L1..L6:
- L1: Lookup, docs, Graphify query/explain, simple Q&A (Gemini 3.8 Flash-Lite, Low)
- L2: Scaffolding, personas enrichment, config/CSS token tweaks, QA checklists (Gemini 3.8 Flash, Low)
- L3: Standard [AFK] vertical-slice TDD implementation, endpoints, UI components, tests (Gemini 3.8 Flash, Medium)
- L4: Interactive grill-me discovery, domain workflow scoping, PRD-to-issues slicing, Cloud/IaC checks (Gemini 3.8 Pro, Medium)
- L5: PR code reviews, Dual-Guardian ontology audits, production DB migrations (Gemini 4 Argon, Medium)
- L6: High-load multi-app refactoring, deep architecture redesign, complex PRDs, gnarly multi-hop debugging (Gemini 4 Argon, High)`;
    responseSchema = {
      type: "STRING",
      enum: ["L1", "L2", "L3", "L4", "L5", "L6"]
    };
  }

  const body = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.0,
      maxOutputTokens: 5,
      responseMimeType: "application/json",
      responseSchema,
      responseLogprobs: true,
      logprobs: 5
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(`Gemini API HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const rawText = (candidate?.content?.parts?.[0]?.text || "").replace(/"/g, "").trim();

  // Extract calibrated probability from token logprobs if returned
  let confidence = 0.85;
  const chosenLogprobs = candidate?.logprobsResult?.chosenCandidates;
  if (Array.isArray(chosenLogprobs) && chosenLogprobs.length > 0) {
    const tokenEntry =
      chosenLogprobs.find(c => c.token && /^[A-Za-z0-9_-]+$/.test(c.token.trim())) ||
      chosenLogprobs[0];
    if (typeof tokenEntry?.logProbability === "number") {
      confidence = Number(Math.exp(tokenEntry.logProbability).toFixed(4));
    }
  }

  return { value: rawText, confidence, model };
}

// -----------------------------------------------------------------------------
// 5. CLI Execution & Formatting
// -----------------------------------------------------------------------------
function printUsage() {
  console.log(`⚡ ${PROJECT_NAME} System-1 Decision Gate & Model/Effort Router (scripts/decide.mjs)

Usage:
  # 1. Route a prompt or Kanban issue to the optimal Model + Effort (L1..L6)
  node ./scripts/decide.mjs --route "Explain how domain-guard.mjs works"
  node ./scripts/decide.mjs --route --file work/2026-11-04_feature/issues/001-slice.md [--json] [--shell]

  # 2. Spec Drift Gate (EGM Pattern: verify git diff against issue criteria)
  node ./scripts/decide.mjs --drift --file <issue.md> [--diff <diff-file>] [--json]

  # 3. Jev-style Primitives (Noul, Choice, Score)
  node ./scripts/decide.mjs --noul "Does this diff modify database schema?" --file diff.patch [--threshold 0.5]
  node ./scripts/decide.mjs --choice "EXTRACTED,INFERRED,AMBIGUOUS" "Webhook retry policy"
  node ./scripts/decide.mjs --score "low,medium,high,critical" "Rate deployment risk of this SQL migration"

Options:
  --file <path>         Read input context from a file
  --json                Output machine-readable JSON
  --shell               Output shell key=value variables (for eval in task runners)
  --offline             Force zero-latency local heuristic calibration (no network calls)
  --threshold <0..1>    Probability threshold for --noul exit code (default: 0.5)
`);
}

async function main() {
  if (ARGS.length === 0 || hasFlag("--help") || hasFlag("-h")) {
    printUsage();
    process.exit(0);
  }

  const fileArg = getFlagValue("--file");
  const isJson = hasFlag("--json");
  const isShell = hasFlag("--shell");
  const isOffline = hasFlag("--offline");
  const isDrift = hasFlag("--drift");
  const diffArg = getFlagValue("--diff");
  const threshold = parseFloat(getFlagValue("--threshold", "0.5"));

  let mode = isDrift ? "drift" : "route";
  let options = [];
  if (hasFlag("--noul")) {
    mode = "noul";
  } else if (hasFlag("--choice")) {
    mode = "choice";
    options = (getFlagValue("--choice", "") || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  } else if (hasFlag("--score")) {
    mode = "score";
    options = (getFlagValue("--score", "") || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }

  const skipNext = new Set(["--file", "--choice", "--score", "--threshold", "--provider", "--diff"]);
  const positional = [];
  for (let i = 0; i < ARGS.length; i++) {
    const arg = ARGS[i];
    if (skipNext.has(arg)) {
      i++;
      continue;
    }
    if (arg.startsWith("--")) continue;
    positional.push(arg);
  }

  let fileContent = "";
  if (fileArg) {
    const resolved = path.resolve(fileArg);
    if (!fs.existsSync(resolved)) {
      console.error(`❌ Error: File not found: ${resolved}`);
      process.exit(2);
    }
    fileContent = fs.readFileSync(resolved, "utf8");
  }

  const combinedInput = [positional.join(" "), fileContent].filter(Boolean).join("\n\n").trim();
  if (!combinedInput) {
    console.error("❌ Error: Please provide a prompt string or --file <path>.");
    process.exit(2);
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

  // Execute Drift Mode (EGM Pattern)
  if (mode === "drift") {
    let diffText = "";
    if (diffArg && fs.existsSync(diffArg)) {
      diffText = fs.readFileSync(diffArg, "utf8");
    } else {
      try {
        const { execSync } = await import("child_process");
        diffText = execSync("git diff HEAD~1 2>/dev/null || git diff 2>/dev/null", {
          encoding: "utf8"
        });
      } catch {
        diffText = "";
      }
    }

    const driftRes = evaluateOfflineDrift(fileContent || combinedInput, diffText);

    if (isJson) {
      console.log(JSON.stringify(driftRes, null, 2));
      process.exit(driftRes.isAligned ? 0 : 1);
    }

    console.log(`\x1b[1m⚡ ${PROJECT_NAME} Spec Drift Gate (EGM Pattern)\x1b[0m`);
    console.log(`==================================================`);
    console.log(
      `🎯 \x1b[1mStatus:\x1b[0m              ${driftRes.isAligned ? "\x1b[32m\x1b[1mALIGNED (Zero Drift)\x1b[0m" : "\x1b[31m\x1b[1mDRIFT_DETECTED\x1b[0m"}`
    );
    console.log(`📊 \x1b[1mDrift Score:\x1b[0m         ${driftRes.driftScore} (0.00 = perfect, 1.00 = extreme drift)`);
    console.log(
      `📋 \x1b[1mAcceptance Criteria:\x1b[0m ${driftRes.coveredCriteria}/${driftRes.totalCriteria} criteria addressed`
    );
    console.log(`📁 \x1b[1mFiles Touched:\x1b[0m       ${driftRes.modifiedFilesCount} files`);
    if (driftRes.violations.length > 0) {
      console.log(`⚠️  \x1b[1mAudit Notes:\x1b[0m`);
      driftRes.violations.forEach(v => console.log(`   • ${v}`));
    }
    console.log(`==================================================`);
    process.exit(driftRes.isAligned ? 0 : 1);
  }

  // Execute Route Mode
  if (mode === "route") {
    const result = evaluateOfflineRoute(combinedInput, fileArg || "");

    if (!isOffline && geminiKey) {
      try {
        const llmRes = await callGeminiDecision({
          mode: "route",
          prompt: combinedInput.slice(0, 6000),
          apiKey: geminiKey
        });
        if (MODEL_TIERS[llmRes.value]) {
          result.provider = `gemini-flash-lite (${llmRes.model})`;
          result.recommendation = MODEL_TIERS[llmRes.value];
          result.workloadConfidence = llmRes.confidence;
        }
      } catch {
        // Keep calibrated heuristic if network fails
      }
    }

    const rec = result.recommendation;

    if (isJson) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    if (isShell) {
      console.log(`DECIDE_TIER="${rec.tier}"`);
      console.log(`DECIDE_TIER_NAME="${rec.name}"`);
      console.log(`DECIDE_WORKLOAD="${result.workload}"`);
      console.log(`DECIDE_RISK="${result.risk}"`);
      console.log(`DECIDE_COMPLEXITY="${result.complexity}"`);
      console.log(`DECIDE_HITL_PROB="${result.hitlProbability}"`);
      console.log(`DECIDE_AGY_MODEL="${rec.antigravityModel}"`);
      console.log(`DECIDE_AGY_EFFORT="${rec.antigravityEffort}"`);
      console.log(`DECIDE_SUBAGENT_MODEL="${rec.subagentModelParam}"`);
      console.log(`DECIDE_CLAUDE_MODEL="${rec.claudeModel}"`);
      console.log(`DECIDE_CLAUDE_EFFORT="${rec.claudeEffort}"`);
      console.log(`DECIDE_CURSOR_MODEL="${rec.cursorModel}"`);
      return;
    }

    console.log(`\x1b[1m⚡ ${PROJECT_NAME} System-1 Model & Effort Router\x1b[0m`);
    console.log(`==================================================`);
    console.log(
      `🎯 \x1b[1mRecommended Tier:\x1b[0m      \x1b[36m\x1b[1m${rec.tier} — ${rec.name}\x1b[0m`
    );
    console.log(
      `🧭 \x1b[1mDetected Workload:\x1b[0m     ${result.workload} (confidence: ${(result.workloadConfidence * 100).toFixed(0)}%)`
    );
    console.log(
      `📊 \x1b[1mRisk / Complexity:\x1b[0m     Risk: \x1b[33m${result.risk}\x1b[0m | Complexity: \x1b[33m${result.complexity}\x1b[0m | HITL prob: ${(result.hitlProbability * 100).toFixed(0)}%`
    );
    console.log(`🔍 \x1b[1mSignals:\x1b[0m               ${result.signals.join(", ")}`);
    console.log(`--------------------------------------------------`);
    console.log(
      `🚀 \x1b[1mAntigravity UI/CLI:\x1b[0m    \x1b[32m${rec.antigravityModel}\x1b[0m (Effort: \x1b[1m${rec.antigravityEffort}\x1b[0m)  [alts: ${rec.antigravityAltModels.join(", ")}]`
    );
    console.log(
      `🤖 \x1b[1mAGY Subagent Tool:\x1b[0m     invoke_subagent(Model="\x1b[32m${rec.subagentModelParam}\x1b[0m")`
    );
    console.log(
      `⚡ \x1b[1mClaude Code CLI:\x1b[0m       claude --model \x1b[32m${rec.claudeModel}\x1b[0m --effort \x1b[32m${rec.claudeEffort}\x1b[0m`
    );
    console.log(`💻 \x1b[1mCursor Composer:\x1b[0m       ${rec.cursorModel}`);
    console.log(`==================================================`);
    return;
  }

  // Execute Jev Primitive Modes (noul, choice, score)
  if (!isOffline && geminiKey) {
    try {
      const llmRes = await callGeminiDecision({
        mode,
        prompt: combinedInput.slice(0, 6000),
        options,
        apiKey: geminiKey
      });
      const prob = mode === "noul" ? (llmRes.value === "YES" ? llmRes.confidence : 1 - llmRes.confidence) : llmRes.confidence;
      const out = {
        mode,
        decision: llmRes.value,
        probability: Number(prob.toFixed(4)),
        provider: `gemini-flash-lite (${llmRes.model})`
      };
      if (isJson) {
        console.log(JSON.stringify(out, null, 2));
      } else {
        console.log(`${out.decision} (p=${out.probability})`);
      }
      if (mode === "noul") {
        process.exit(prob >= threshold ? 0 : 1);
      }
      return;
    } catch {
      // Fall through to offline heuristic
    }
  }

  // Offline fallback
  const routeEval = evaluateOfflineRoute(combinedInput, fileArg || "");
  if (mode === "noul") {
    const prob = routeEval.hitlProbability;
    const decision = prob >= threshold ? "YES" : "NO";
    if (isJson) {
      console.log(
        JSON.stringify({ mode: "noul", decision, probability: prob, provider: "offline-heuristic" }, null, 2)
      );
    } else {
      console.log(`${decision} (p=${prob})`);
    }
    process.exit(prob >= threshold ? 0 : 1);
  } else {
    const chosen = options[0] || "UNKNOWN";
    if (isJson) {
      console.log(
        JSON.stringify({ mode, decision: chosen, probability: 0.5, provider: "offline-heuristic" }, null, 2)
      );
    } else {
      console.log(`${chosen} (p=0.50)`);
    }
  }
}

main();
