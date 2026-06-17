# DOX framework

- DOX is highly performant AGENTS.md hierarchy installed here
- Agent must follow DOX instructions across any edits

## Core Contract

- AGENTS.md files are binding work contracts for their subtrees
- Work products, source materials, instructions, records, assets, and durable docs must stay understandable from the nearest applicable AGENTS.md plus every parent AGENTS.md above it

## Read Before Editing

1. Read this root AGENTS.md before project edits
2. Identify every file or folder you expect to touch
3. Walk from the repository root to each target path
4. Read every AGENTS.md found along each route
5. If a parent AGENTS.md lists a child AGENTS.md whose scope contains the path, read that child and continue from there
6. Use the nearest AGENTS.md as the local contract and parent docs for repo-wide rules
7. If docs conflict, the closer doc controls local work details, but no child doc may weaken DOX

Do not rely on memory. Re-read the applicable DOX chain in the current session before editing.

## Update After Editing

Every meaningful change requires a DOX pass before the task is done.

Update the closest owning AGENTS.md when a change affects:

- purpose, scope, ownership, or responsibilities
- durable structure, contracts, workflows, or operating rules
- required inputs, outputs, permissions, constraints, side effects, or artifacts
- user preferences about behavior, communication, process, organization, or quality
- AGENTS.md creation, deletion, move, rename, or index contents

Update parent docs when parent-level structure, ownership, workflow, or child index changes. Update child docs when parent changes alter local rules. Remove stale or contradictory text immediately.

## Hierarchy

- Root AGENTS.md is the DOX rail: project-wide instructions, global preferences, durable workflow rules, and the top-level Child DOX Index
- Child AGENTS.md files own domain-specific instructions and their own Child DOX Index
- Each parent explains what its direct children cover and what stays owned by the parent
- The closer a doc is to the work, the more specific and practical it must be

## Style

- Keep docs concise, current, and operational
- Document stable contracts, not diary entries
- Put broad rules in parent docs and concrete details in child docs
- Prefer direct bullets with explicit names
- Do not duplicate rules across many files unless each scope needs a local version
- Delete stale notes instead of explaining history

## Closeout

1. Re-check changed paths against the DOX chain
2. Update nearest owning docs and any affected parents or children
3. Refresh every affected Child DOX Index
4. Remove stale or contradictory text
5. Run existing verification when relevant

## AI Study Game Contract

- Local Windows 11 study game built with Tauri + React + TypeScript + Vite.
- Router lives in `src/components/AppShell.tsx` and uses HashRouter.
- Question banks live in `public/questions/`; generated question scripts live in `scripts/`.
- Learn Python code-reading game lives in `src/data/learningPythonMissions.ts` and `src/screens/LearningPythonScreen.tsx`.
- Learn Python target style: kid-friendly cyber/arcade, short snippets, code-reading comprehension only, no writing Python.
- Learn Python worlds must contain 15 normal missions per world plus at least 1 boss mission.
- Learn Python normal mission numbers must be exactly `1` through `15`; boss missions use `missionNumber: 0`.
- Learn Python questions stay 4-option MCQ with exact `correctAnswer` string included in `options`.
- Allowed Learn Python mission types: `what_prints`, `whats_the_value`, `does_it_crash`, `boss_gauntlet`.
- Difficulty curve: missions 1-5 easy, 6-10 medium, 11-15 hard, boss harder.
- Use fair beginner traps: variable reassignment, string vs number, zero-based indexes, missing dict key/list index crashes, branch order, range stop exclusion, break/continue, return vs print.
- Do not add filler. More content is only useful when it teaches real Python behavior.

## Required Verification

After Learn Python edits run:

```bash
npm run qa:learn-python
npm run build
```

Known non-blocking build warnings:

- large Vite chunk warning
- `database.ts` dynamic/static import overlap warning

## Child DOX Index

No child AGENTS.md files currently exist under this project.
