import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const projectRoot = process.cwd();
const missionFile = path.join(projectRoot, "src", "data", "pythonReaderMissions.ts");
const source = fs.readFileSync(missionFile, "utf8");

const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
    verbatimModuleSyntax: false
  }
}).outputText;

const tempPath = path.join(os.tmpdir(), `python-reader-missions-${Date.now()}.mjs`);
fs.writeFileSync(tempPath, transpiled);

let missions;
try {
  const mod = await import(pathToFileURL(tempPath).href);
  missions = mod.pythonReaderMissions;
} catch (error) {
  fail(`Mission data is not importable after TypeScript transpile: ${error.message}`);
} finally {
  fs.rmSync(tempPath, { force: true });
}

const validPacks = new Set([
  "python_shapes",
  "trace_flow",
  "io_side_effects",
  "files_data_apis",
  "review_before_run",
  "functions_reuse",
  "data_over_time",
  "errors_debugging",
  "ai_scripts",
  "reading_code",
  "python_vocab"
]);
const validTypes = new Set([
  "trace_execution",
  "plain_english",
  "input_output_side_effect",
  "risk_detection",
  "bug_prediction",
  "hidden_assumption",
  "safe_to_run",
  "ai_review_prompt"
]);
const requiredStringFields = [
  "id",
  "pack",
  "type",
  "title",
  "objective",
  "code",
  "prompt",
  "explanation",
  "reviewerNote"
];
const secretLikePatterns = [
  /sk-[A-Za-z0-9]{16,}/,
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN [A-Z ]+PRIVATE KEY-----/,
  /ghp_[A-Za-z0-9]{20,}/
];

const errors = [];
const ids = new Set();

if (!Array.isArray(missions)) {
  fail("Mission export must be an array.");
}

for (const mission of missions) {
  const label = mission?.id || "<missing id>";

  for (const field of requiredStringFields) {
    if (typeof mission[field] !== "string" || mission[field].trim().length === 0) {
      errors.push(`${label}: ${field} must be a non-empty string.`);
    }
  }

  if (ids.has(mission.id)) {
    errors.push(`${label}: duplicate id.`);
  }
  ids.add(mission.id);

  if (!validPacks.has(mission.pack)) {
    errors.push(`${label}: invalid pack "${mission.pack}".`);
  }

  if (!validTypes.has(mission.type)) {
    errors.push(`${label}: invalid type "${mission.type}".`);
  }

  if (![1, 2, 3, 4, 5].includes(mission.level)) {
    errors.push(`${label}: level must be 1-5.`);
  }

  if (!Array.isArray(mission.options) || mission.options.length < 2) {
    errors.push(`${label}: options must include at least two answers.`);
  }

  if (!Array.isArray(mission.tags) || mission.tags.length === 0) {
    errors.push(`${label}: tags must be a non-empty array.`);
  }

  const options = new Set(mission.options || []);
  const answers = Array.isArray(mission.correctAnswer)
    ? mission.correctAnswer
    : [mission.correctAnswer];

  if (answers.length === 0) {
    errors.push(`${label}: correctAnswer must not be empty.`);
  }

  for (const answer of answers) {
    if (!options.has(answer)) {
      errors.push(`${label}: correct answer "${answer}" does not exist in options.`);
    }
  }

  const codeLines = typeof mission.code === "string"
    ? mission.code.split(/\r?\n/).filter((line) => line.trim().length > 0).length
    : 0;

  if (codeLines < 3 || codeLines > 25) {
    errors.push(`${label}: code must be 3-25 non-empty lines; found ${codeLines}.`);
  }

  for (const pattern of secretLikePatterns) {
    if (pattern.test(mission.code) || pattern.test(mission.explanation || "")) {
      errors.push(`${label}: contains a secret-like token.`);
    }
  }
}

if (missions.length < 25) {
  errors.push(`Expected at least 25 missions, found ${missions.length}.`);
}

if (errors.length > 0) {
  console.error("Python Reader mission validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Python Reader mission validation passed: ${missions.length} missions.`);

function fail(message) {
  console.error(message);
  process.exit(1);
}
