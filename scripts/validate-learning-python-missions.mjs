import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const projectRoot = process.cwd();
const sourcePath = path.join(projectRoot, 'src', 'data', 'learningPythonMissions.ts');
const source = fs.readFileSync(sourcePath, 'utf8');

const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
    verbatimModuleSyntax: false
  }
}).outputText;

const tempPath = path.join(os.tmpdir(), `learning-python-missions-${Date.now()}.mjs`);
fs.writeFileSync(tempPath, transpiled);

try {
  const mod = await import(pathToFileURL(tempPath).href);
  const { learningPythonMissions, WORLDS, WORLD_CONFIG } = mod;
  const problems = [];
  const ids = new Set();

  if (!Array.isArray(WORLDS) || WORLDS.length !== 6) {
    problems.push(`expected 6 worlds, got ${Array.isArray(WORLDS) ? WORLDS.length : 'non-array'}`);
  }

  for (const world of WORLDS) {
    if (!WORLD_CONFIG[world]) problems.push(`missing WORLD_CONFIG for ${world}`);
  }

  for (const mission of learningPythonMissions) {
    if (ids.has(mission.id)) problems.push(`duplicate mission id: ${mission.id}`);
    ids.add(mission.id);
    if (!WORLDS.includes(mission.world)) problems.push(`${mission.id}: unknown world ${mission.world}`);
    if (!Array.isArray(mission.options) || mission.options.length !== 4) problems.push(`${mission.id}: expected exactly 4 options`);
    if (new Set(mission.options).size !== mission.options.length) problems.push(`${mission.id}: duplicate options`);
    if (!mission.options.includes(mission.correctAnswer)) problems.push(`${mission.id}: correctAnswer missing from options`);
    if (mission.isBoss && mission.missionNumber !== 0) problems.push(`${mission.id}: boss missionNumber must be 0`);
    if (!mission.isBoss && (mission.missionNumber < 1 || mission.missionNumber > 15)) problems.push(`${mission.id}: normal missionNumber must be 1-15`);
    if (!mission.code?.trim()) problems.push(`${mission.id}: missing code`);
    if (!mission.explanation?.trim()) problems.push(`${mission.id}: missing explanation`);
  }

  for (const world of WORLDS) {
    const normal = learningPythonMissions.filter(m => m.world === world && !m.isBoss);
    const bosses = learningPythonMissions.filter(m => m.world === world && m.isBoss);
    const missionNumbers = normal.map(m => m.missionNumber).sort((a, b) => a - b).join(',');
    if (normal.length !== 15) problems.push(`${world}: expected 15 normal missions, got ${normal.length}`);
    if (missionNumbers !== '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15') problems.push(`${world}: normal mission numbers must be 1-15; got ${missionNumbers || 'none'}`);
    if (bosses.length < 1) problems.push(`${world}: expected at least 1 boss mission`);
  }

  const byWorld = Object.fromEntries(WORLDS.map(world => [
    world,
    {
      normal: learningPythonMissions.filter(m => m.world === world && !m.isBoss).length,
      boss: learningPythonMissions.filter(m => m.world === world && m.isBoss).length
    }
  ]));

  console.log(JSON.stringify({
    count: learningPythonMissions.length,
    worlds: WORLDS.length,
    byWorld,
    problems: problems.slice(0, 50)
  }, null, 2));

  if (problems.length) process.exit(1);
} finally {
  fs.rmSync(tempPath, { force: true });
}
