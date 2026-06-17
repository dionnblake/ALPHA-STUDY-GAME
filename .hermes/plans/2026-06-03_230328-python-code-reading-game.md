# Python Code Reading Game Implementation Plan

## Goal

Add a focused game mode to the existing AI Study Game that teaches Blake to **read and review Python code**, not write it from scratch.

Primary outcome:

> Blake can inspect AI-written Python, explain what it does, identify inputs/outputs/side effects, spot common risks, and ask better coding-agent follow-up questions.

## Current context

- App stack: Tauri + React + TypeScript + Vite.
- Router: `src/components/AppShell.tsx`.
- Navigation: `src/components/Sidebar.tsx`.
- Existing quiz data: `public/questions/*.json` seeded through `src/services/seedingService.ts`.
- Existing question model supports `multiple_choice`, `multiple_response`, `ordering`, `case_study`, `fill_in_blank`.
- Scenario Labs already has a drag/drop interaction pattern in `src/screens/ScenarioLabsScreen.tsx`.
- Best fit is a new focused screen, not only another multiple-choice bank.

Note: Multi-agent delegation was attempted for research and architecture review, but Hermes subagents failed with provider connection errors. I continued planning directly from project inspection and established learning principles.

## Core product concept

Create a new route:

```text
/python-reader
```

Sidebar label:

```text
Python Reader
```

Game name:

```text
CodeTrace: Python Reader
```

Positioning:

```text
Learn to read Python like an AI code reviewer. Trace the code. Find the inputs. Catch the risk.
```

## Recommended game style

Use a **mission-based code review simulator**, not a generic quiz.

Fastest learning mechanics:

1. **Trace the Flow**
   - User reads a short snippet.
   - Chooses what happens first, next, last.
   - Teaches execution order.

2. **Input / Output / Side Effect tagging**
   - User identifies:
     - what data enters
     - what data leaves
     - what files/API/database changes
   - Directly trains code review thinking.

3. **Plain-English Translation**
   - User picks the best plain-English summary of a snippet.
   - Teaches comprehension without forcing writing.

4. **Risk Detection**
   - User spots issues like overwriting files, missing error handling, hardcoded paths, unsafe deletes, API key exposure.
   - Trains AI-code supervision.

5. **Bug Prediction**
   - User chooses what would break if data is missing/wrong.
   - Teaches practical debugging.

6. **Pattern Recognition Cards**
   - `def`, `for`, `if`, `with open`, `json.load`, `dict.get`, `try/except`, etc.
   - Short drills for syntax fluency.

## Curriculum progression

### Level 1: Python shapes

Goal: recognize syntax.

Topics:

- variables
- strings/numbers/booleans
- lists
- dictionaries
- comments
- `print`
- `import`

Challenge types:

- "What does this line create?"
- "What type of data is this?"
- "Which value is being looked up?"

### Level 2: Control flow

Goal: follow what runs.

Topics:

- `if / elif / else`
- `for`
- `while`
- `continue`
- `break`

Challenge types:

- order steps
- predict skipped lines
- identify loop target

### Level 3: Functions

Goal: understand reusable blocks.

Topics:

- `def`
- parameters
- return values
- function calls
- scope basics

Challenge types:

- "What goes into this function?"
- "What comes back?"
- "Where is this function called?"

### Level 4: Files and data

Goal: understand real automation scripts.

Topics:

- `with open(...)`
- `json.load`
- `json.dump`
- CSV basics
- paths with `os.path`

Challenge types:

- identify files read
- identify files changed
- detect destructive writes

### Level 5: Code review mode

Goal: supervise AI-written scripts.

Topics:

- missing error handling
- unsafe file deletion
- hardcoded credentials
- path assumptions
- data shape assumptions
- API failure handling
- logging

Challenge types:

- "Would you run this?"
- "What should you ask AI to fix?"
- "What is the highest-risk line?"

## Data model recommendation

Do **not** force this into only the existing DB question shape at first.

Create a local TypeScript data file first:

```text
src/data/pythonReaderMissions.ts
```

Reason:

- Faster to build.
- Easier to support code snippets, step ordering, tagging, and review tasks.
- Avoids forcing code-review missions into the existing multiple-choice schema.
- Can later migrate into SQLite if needed.

Suggested mission shape:

```ts
export type PythonReaderMissionType =
  | 'plain_english'
  | 'trace_order'
  | 'input_output_side_effect'
  | 'risk_detection'
  | 'bug_prediction'
  | 'syntax_pattern';

export type PythonReaderMission = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  type: PythonReaderMissionType;
  title: string;
  objective: string;
  code: string;
  prompt: string;
  options?: string[];
  correctAnswer?: string | string[];
  orderedSteps?: string[];
  explanation: string;
  reviewerNote: string;
  tags: string[];
};
```

## Implementation steps

### Step 1: Add mission data

Create:

```text
src/data/pythonReaderMissions.ts
```

Start with 25 missions:

- 5 syntax recognition
- 5 control flow
- 5 function reading
- 5 files/JSON scripts
- 5 code review/risk missions

Use real-world automation examples:

- clean JSON
- rename files
- call an API
- process leads
- update a CSV
- check missing values
- write output files

Keep snippets short: 5 to 25 lines.

### Step 2: Add the screen

Create:

```text
src/screens/PythonReaderScreen.tsx
src/screens/PythonReaderScreen.css
```

Core UI:

- mission header
- level badge
- code block
- prompt
- answer interaction
- evaluate button
- feedback panel
- reviewer note
- next mission button
- progress meter

Use existing dark HUD style from `ScenarioLabsScreen.css` and `QuizScreen.css`.

### Step 3: Support mission interactions

Minimum viable interaction types:

1. Single-choice answer
2. Multi-select answer
3. Step ordering
4. Tagging: Input / Output / Side Effect / Risk

Do not overbuild drag/drop at first. Use clickable cards/buttons first for reliability in Tauri.

### Step 4: Add route

Update:

```text
src/components/AppShell.tsx
```

Add import:

```ts
import { PythonReaderScreen } from '../screens/PythonReaderScreen';
```

Add route:

```tsx
<Route path="/python-reader" element={<PythonReaderScreen />} />
```

Also update `isQuizRoute` if the layout needs the same full-width/zoom behavior.

### Step 5: Add sidebar link

Update:

```text
src/components/Sidebar.tsx
```

Add:

```ts
{ path: '/python-reader', label: 'Python Reader' }
```

Recommended placement: near `Scenario Labs`, because this is an interactive skill lab, not a normal certification track.

### Step 6: Add lightweight progress

MVP: use `localStorage` first.

Keys:

```text
python_reader_completed_ids
python_reader_current_index
python_reader_accuracy
```

Reason:

- Avoids DB migration during MVP.
- Fast to ship.
- Can migrate later if this becomes a core mode.

Later upgrade:

- add `session_type = 'python_reader'`
- record attempts in SQLite
- integrate into dashboard stats

### Step 7: Add validation script

Create optional script:

```text
scripts/validate-python-reader-missions.mjs
```

Checks:

- unique IDs
- non-empty code
- non-empty prompt
- valid mission type
- explanation exists
- reviewer note exists
- correct answer exists where required

Add package script:

```json
"qa:python-reader": "node scripts/validate-python-reader-missions.mjs"
```

### Step 8: Build and verify

Run:

```bash
npm run build
```

Manual QA:

- route loads
- sidebar active state works
- each mission evaluates correctly
- next/reset works
- progress persists after refresh
- code block remains readable at zoom levels
- buttons work in Tauri WebView

## Files likely to change

Required:

```text
src/data/pythonReaderMissions.ts
src/screens/PythonReaderScreen.tsx
src/screens/PythonReaderScreen.css
src/components/AppShell.tsx
src/components/Sidebar.tsx
```

Optional:

```text
scripts/validate-python-reader-missions.mjs
package.json
src/types/models.ts
src/services/database.ts
src/services/analyticsService.ts
src/services/sessionService.ts
```

Avoid touching DB/services during MVP unless needed.

## MVP scope

Build only the first usable version:

- one new screen
- 25 missions
- localStorage progress
- four interaction patterns max
- no DB migration
- no dashboard integration yet
- no AI generation inside the app yet

This keeps it shippable.

## Phase 2 scope

After MVP works:

- add 100 total missions
- add spaced repetition
- add dashboard stats
- add Python Reader mastery domains
- add real scripts from Blake's projects
- add "Ask AI better" challenge type where Blake chooses the best code-review prompt
- add AI-generated mission importer later if useful

## Mastery gates

Blake should progress when he can reliably answer:

1. What does this code do?
2. What data goes in?
3. What data comes out?
4. What changes outside the function?
5. What file/API/database does this touch?
6. What line is risky?
7. What should I ask AI to fix?

## Risks and tradeoffs

### Risk: generic Python trivia

Mitigation: every mission must be framed as code-reading or code-review, not textbook syntax.

### Risk: too much writing practice

Mitigation: no freeform coding in MVP. All interactions are reading, selecting, ordering, tagging, or reviewing.

### Risk: forcing complex missions into old quiz schema

Mitigation: TypeScript mission data first. DB later.

### Risk: boring UI

Mitigation: use mission language, code-review stakes, risk flags, and concise feedback.

### Risk: snippets too long

Mitigation: 5 to 25 lines max until advanced mode.

## Open questions

Only one question matters before implementation:

> Should the MVP use only generated practice snippets, or should it include real snippets from Blake's existing project scripts like `scripts/fix_bias.py`?

Recommendation: include both.

- 80% clean designed snippets for progression.
- 20% real project snippets for relevance.

## Recommended next execution prompt

```text
Implement the Python Reader MVP from .hermes/plans/2026-06-03_230328-python-code-reading-game.md. Keep it surgical. No DB migration. Add 25 mission records, one new screen, route, sidebar item, localStorage progress, validation script, and run npm run build.
```
