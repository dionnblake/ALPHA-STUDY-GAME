# Python Reader Game Plan — Subagent Reviewed

## Goal

Add a game mode to the existing AI Study Game that teaches Blake to **read and review Python**, not write it from scratch.

Primary outcome:

> Blake can inspect AI-generated Python, explain behavior, trace data flow, identify side effects, spot risk, and ask better AI follow-up prompts before running code.

## Subagent pass

Three fresh Hermes research agents were run after fixing delegation config.

### Agent 1 — Game mechanics research

Recommended fastest mechanics:

1. **Execution tracing puzzles**
   - Predict variable values, printed output, branch paths, loop behavior, and returns.
   - Highest transfer to real code review.

2. **Input/output contract matching**
   - Given inputs, choose expected output or broken edge cases.
   - Trains boundary thinking around AI happy-path code.

3. **Side effect spotting**
   - Mark file writes, API calls, DB updates, mutation, env vars, logs, time/random.
   - Critical for deciding if AI code is safe to run.

4. **Bug prediction before running**
   - Identify likely failure: missing key, broad except, type mismatch, off-by-one, wrong return, infinite loop.

5. **Risk labeling / code review triage**
   - Safe / Needs Test / Risky / Do Not Run.
   - Best match for founder/operator use.

6. **Find hidden assumption**
   - File exists, API response has key, network works, data is clean, permissions are valid.

7. **Minimal test case selection**
   - Pick the smallest useful set of edge cases without writing tests manually.

8. **AI review prompt battle cards**
   - Choose the best follow-up prompt to ask AI after inspecting code.

Best framing:

> Review Before You Run

Premise:

> AI generated this Python script. Your job is to decide if it is safe, what it does, and what to ask next before running it.

### Agent 2 — App architecture review

Recommendation:

> Build a standalone custom game screen backed by a TypeScript mission data file. Do not force this into the existing quiz bank for v1.

Why:

- Existing quiz bank is optimized for certification-style multiple choice.
- Python reading needs code snippets, trace steps, side effect labels, risk notes, and code-review prompts.
- Existing DB schema has no clean `code` field.
- Using `public/questions/*.json` would require `seedingService.ts`, SQLite reseeding, and possible `db_version` updates.
- Custom TypeScript data ships faster and avoids breaking existing quiz tracks.

Lowest-friction files:

Create:

```text
src/data/pythonReaderMissions.ts
src/screens/PythonReaderScreen.tsx
src/screens/PythonReaderScreen.css
scripts/validate-python-reader-missions.mjs
```

Modify:

```text
src/components/AppShell.tsx
src/components/Sidebar.tsx
package.json
```

Avoid for v1:

```text
src/services/database.ts
src/services/seedingService.ts
src/hooks/useQuiz.ts
public/questions/*.json
```

Architecture warning verified by parent session:

```bash
npx tsc --noEmit
```

Current result before any Python Reader work:

```text
src/screens/ScenarioLabsScreen.tsx(297,11): error TS6133: 'isComplete' is declared but its value is never read.
```

So implementation should either fix that one unused variable first or expect final build to fail for a pre-existing reason.

### Agent 3 — Curriculum design

Recommended curriculum order:

1. Read simple scripts
2. Understand imports
3. Trace conditionals
4. Trace loops
5. Understand functions
6. Read lists and dictionaries
7. Review file IO
8. Review JSON/CSV
9. Review `try/except`
10. Review API calls
11. Map side effects
12. Flag security risks
13. Simulate real PR review

Core lesson principle:

> What is this code doing, and should we trust it?

Avoid:

- blank-screen code writing
- syntax lectures
- toy calculators
- LeetCode/algorithm puzzles
- decorators/generators/metaclasses early
- advanced OOP early
- executing arbitrary Python inside the app

## Product decision

Build:

```text
CodeTrace: Python Reader
```

Route:

```text
/python-reader
```

Sidebar label:

```text
Python Reader
```

Game frame:

```text
Review AI-generated Python before you trust it.
```

This should feel like a **code review simulator**, not a beginner programming course.

## MVP scope

Ship a focused v1:

- one new screen
- custom mission data file
- 25 curated missions
- 5 mission packs
- localStorage progress
- no SQLite changes
- no question bank reseed
- no Python execution
- validation script
- build/typecheck verification

## Mission packs for v1

### Pack 1 — Python Shapes

Goal: recognize what code is made of.

Concepts:

- variables
- strings/numbers/booleans
- comments
- indentation
- imports
- lists/dicts basics

Mission examples:

- What value is stored here?
- What does this import allow the script to do?
- What kind of data is this?

### Pack 2 — Trace the Flow

Goal: follow what runs.

Concepts:

- `if / elif / else`
- `for`
- `while`
- function calls
- `return`

Mission examples:

- Which branch runs?
- How many times does this loop run?
- What does this function return?

### Pack 3 — Inputs, Outputs, Side Effects

Goal: separate data in, data out, and real-world changes.

Concepts:

- parameters
- return values
- mutation
- file reads/writes
- print/logging
- env vars

Mission examples:

- What is the input?
- What is returned?
- What does this code change outside itself?

### Pack 4 — Files, JSON, CSV, APIs

Goal: understand useful automation scripts.

Concepts:

- `with open(...)`
- `json.load`
- `json.dump`
- `csv.DictReader`
- `requests.get/post`
- timeouts
- API keys

Mission examples:

- What file is read?
- What file is overwritten?
- What data is sent externally?
- What breaks if this key is missing?

### Pack 5 — Review Before You Run

Goal: inspect AI-generated scripts like an operator.

Concepts:

- destructive file operations
- broad `except`
- hardcoded secrets
- missing timeouts
- risky `subprocess`
- unsafe paths
- privacy leaks
- business blast radius

Mission examples:

- Safe / Caution / Block?
- What is the highest-risk line?
- What should you ask AI to fix?
- What hidden assumption does this code make?

## Mission types

Use this mission type union:

```ts
export type PythonReaderMissionType =
  | 'trace_execution'
  | 'plain_english'
  | 'input_output_side_effect'
  | 'risk_detection'
  | 'bug_prediction'
  | 'hidden_assumption'
  | 'safe_to_run'
  | 'ai_review_prompt';
```

Recommended mission shape:

```ts
export type PythonReaderMission = {
  id: string;
  pack: 'python_shapes' | 'trace_flow' | 'io_side_effects' | 'files_data_apis' | 'review_before_run';
  level: 1 | 2 | 3 | 4 | 5;
  type: PythonReaderMissionType;
  title: string;
  objective: string;
  code: string;
  prompt: string;
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  reviewerNote: string;
  aiPromptToAsk?: string;
  tags: string[];
};
```

Notes:

- `aiPromptToAsk` is important. It directly trains Blake to use AI better after reading code.
- Keep snippets 5 to 25 lines for v1.
- Use 80% designed snippets, 20% real project-inspired snippets.
- Include one mission based on `scripts/fix_bias.py` concept: JSON question bank in, shuffled answer options out, file rewritten.

## UI plan

### Screen layout

`PythonReaderScreen.tsx` should include:

1. Header
   - `CodeTrace: Python Reader`
   - subtitle: `Review AI-generated Python before you run it.`

2. Pack/mission rail
   - current pack
   - level badge
   - progress count
   - accuracy

3. Code panel
   - `<pre><code>`
   - preserve indentation
   - no syntax highlighter dependency for v1

4. Challenge panel
   - prompt
   - answer cards/buttons
   - multi-select support for side effects
   - evaluate button

5. Feedback panel
   - correct/incorrect
   - explanation
   - reviewer note
   - best AI prompt to ask next

6. Controls
   - next mission
   - previous mission
   - reset progress

### Interaction rules

Support v1 answer modes through one flexible implementation:

- single choice
- multi-select
- safe/caution/block triage
- “select all side effects” checklist

Skip drag/drop in v1. Clickable cards are more reliable in Tauri WebView.

## Progress storage

Use localStorage first.

Keys:

```text
python_reader_completed_ids
python_reader_current_index
python_reader_attempts
python_reader_correct_count
```

Do not use SQLite in v1.

Reason:

- fastest path
- no DB migration risk
- no reseeding risk
- enough for first playable mode

## Implementation steps

### Step 0 — Clear existing build blocker

Fix verified pre-existing TypeScript issue:

```text
src/screens/ScenarioLabsScreen.tsx
```

Remove unused `isComplete` at line 297 or use it if it was intended.

Validation:

```bash
npx tsc --noEmit
```

### Step 1 — Add mission data

Create:

```text
src/data/pythonReaderMissions.ts
```

Add 25 missions:

- 5 Python Shapes
- 5 Trace the Flow
- 5 Inputs/Outputs/Side Effects
- 5 Files/JSON/CSV/APIs
- 5 Review Before You Run

Each mission must include:

- code snippet
- prompt
- options
- correct answer
- explanation
- reviewer note
- AI prompt to ask next

### Step 2 — Add mission validator

Create:

```text
scripts/validate-python-reader-missions.mjs
```

Checks:

- unique IDs
- valid pack
- valid type
- non-empty title/objective/code/prompt/options
- correct answer exists in options
- multi-answer values exist in options
- explanation exists
- reviewer note exists
- snippets do not include fake secrets that look real

Add script to `package.json`:

```json
"qa:python-reader": "node scripts/validate-python-reader-missions.mjs"
```

### Step 3 — Add screen

Create:

```text
src/screens/PythonReaderScreen.tsx
src/screens/PythonReaderScreen.css
```

Implementation details:

- import missions from `src/data/pythonReaderMissions.ts`
- use `useMemo` for mission lookup/stats
- use `useState` for selected answers and feedback
- use localStorage helpers inside the screen or small internal functions
- no new global state
- no DB calls
- no Python execution
- no markdown renderer

### Step 4 — Add route

Modify:

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

Consider updating `isQuizRoute` only if the screen needs quiz-style full-width behavior. Default recommendation: do not add it unless layout proves cramped.

### Step 5 — Add sidebar item

Modify:

```text
src/components/Sidebar.tsx
```

Add near Scenario Labs:

```ts
{ path: '/python-reader', label: 'Python Reader' },
```

### Step 6 — Validate

Run:

```bash
npm run qa:python-reader
npx tsc --noEmit
npm run build
```

Manual check:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/#/python-reader
```

Verify:

- sidebar link appears
- route loads
- code block preserves indentation
- answers evaluate correctly
- multi-select missions work
- progress persists after refresh
- reset clears progress
- no console errors

Tauri check if needed:

```bash
npm run tauri dev
```

## Files likely to change

Required:

```text
src/data/pythonReaderMissions.ts
src/screens/PythonReaderScreen.tsx
src/screens/PythonReaderScreen.css
src/components/AppShell.tsx
src/components/Sidebar.tsx
scripts/validate-python-reader-missions.mjs
package.json
```

Small pre-existing build fix:

```text
src/screens/ScenarioLabsScreen.tsx
```

Avoid for MVP:

```text
src/services/database.ts
src/services/seedingService.ts
src/hooks/useQuiz.ts
src/services/analyticsService.ts
public/questions/*.json
```

## Quality gates

A mission is good only if it teaches one of these reviewer skills:

- What does the code do?
- What runs first/next/last?
- What data goes in?
- What data comes out?
- What changes outside the function?
- What file/API/database/user does it touch?
- What could break?
- What is unsafe?
- What should I ask AI to check/fix?

Reject missions that are only syntax trivia.

## Risks and mitigations

### Risk: turning into generic Python lessons

Mitigation:

Every mission must be framed as code review, safety, or behavior tracing.

### Risk: too much writing

Mitigation:

No blank-screen coding in v1. Use selection, tagging, triage, and explanation cards.

### Risk: DB complexity

Mitigation:

Use localStorage and TS data file first.

### Risk: false confidence

Mitigation:

Include “reviewer note” and “AI prompt to ask next” after every answer.

### Risk: app build blocked by old issue

Mitigation:

Fix unused `isComplete` before final validation.

### Risk: snippets too long

Mitigation:

5 to 25 lines max in v1.

## Open question

No blocking question.

Recommended default:

> Use mostly designed snippets, plus a few real-project-inspired snippets from this app/scripts.

Start with 25 missions and ship the first playable mode. Expand after Blake uses it.

## Recommended execution prompt

```text
Implement the Python Reader MVP from .hermes/plans/2026-06-03_232906-python-reader-subagent-plan.md. Keep it surgical. Fix the pre-existing unused isComplete build blocker, add 25 missions, one new screen, route, sidebar item, localStorage progress, validator script, and run npm run qa:python-reader, npx tsc --noEmit, and npm run build.
```
