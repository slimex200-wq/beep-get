import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const defaultEvidencePath = ".release/ios-submission-evidence.json";
const args = process.argv.slice(2);

if (args.length > 1 || args.includes("--help") || args.includes("-h") || args.some((arg) => arg.startsWith("--"))) {
  printUsage();
  process.exit(args.includes("--help") || args.includes("-h") ? 0 : 1);
}

const evidencePath = args[0] ?? defaultEvidencePath;

runNodeStep("repo-local iOS release readiness", ["scripts/ios-release-readiness.mjs"]);

if (!fs.existsSync(path.resolve(root, evidencePath))) {
  console.error(`iOS submission gate failed: missing private evidence file ${evidencePath}`);
  console.error("Initialize the ignored fail-by-default evidence file, complete it with real redacted QA evidence, then rerun this gate:");
  console.error(`npm.cmd run release:ios:evidence:init -- ${evidencePath}`);
  console.error(`npm.cmd run release:ios:submission -- ${evidencePath}`);
  process.exit(1);
}

runNodeStep("private redacted iOS submission evidence", [
  "scripts/ios-submission-evidence-check.mjs",
  evidencePath,
]);

console.log("iOS submission gate passed: repo-local checks and private redacted submission evidence are green.");

function runNodeStep(label, stepArgs) {
  console.log(`[iOS submission gate] ${label}`);
  const result = spawnSync(process.execPath, stepArgs, {
    cwd: root,
    encoding: "utf8",
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.status !== 0) {
    console.error(`iOS submission gate failed during ${label}.`);
    process.exit(result.status ?? 1);
  }
}

function printUsage() {
  console.error(`Usage: npm.cmd run release:ios:submission -- [${defaultEvidencePath}]`);
}
