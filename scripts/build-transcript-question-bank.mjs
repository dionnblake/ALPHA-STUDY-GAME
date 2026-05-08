import fs from "node:fs";
import path from "node:path";

const INPUT_PATH =
  process.argv[2] || "C:/Users/illpr/Downloads/ggogle ai essentials.txt";
const OUTPUT_PATH =
  process.argv[3] ||
  "C:/Users/illpr/Desktop/VIBE CODING PROJECTS/AI STUDY GAME WINDOWS 11/public/questions/google_ai_essentials_transcript_questions.json";

function stripTimeNoise(text) {
  return String(text)
    .replace(/\uFEFF/g, "")
    .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\d*\b/g, " ")
    .replace(/\b\d+\s*(?:hours|minutes|seconds|hour|minute|second)(?=[A-Za-z])?/gi, " ")
    .replace(/\b(?:hours|minutes|seconds|hour|minute|second)(?=[A-Z])/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanLine(raw) {
  let line = stripTimeNoise(raw);
  if (!line) return "";

  // Remove occasional leading OCR residue.
  line = line.replace(/^[,.;:\-\s]+/, "").trim();
  return line;
}

function tidy(text) {
  return stripTimeNoise(text)
    .replace(/^\d{1,3}\s+/, "")
    .replace(/\bss(?=[a-z])/gi, "s")
    .replace(/\s+([,.;:?!])/g, "$1")
    .replace(/^[,.;:\-\s]+/, "")
    .replace(/[,.;:\-\s]+$/, "")
    .trim();
}

function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferCategory(chapter) {
  const c = normalize(chapter);
  if (c.includes("ethic") || c.includes("responsibil")) return "bias-fairness";
  if (c.includes("google ai tools") || c.includes("google workspace")) return "google-tools";
  if (c.includes("productivity") || c.includes("time management") || c.includes("automation"))
    return "time-management";
  if (c.includes("future") || c.includes("skill") || c.includes("upskill"))
    return "upskilling";
  if (c.includes("type")) return "ai-types";
  if (c.includes("application")) return "ai-applications";
  if (c.includes("terminology") || c.includes("concept")) return "ai-terminology";
  return "fundamentals";
}

function extractOptions(optionsBlob) {
  // Keep content as-is from transcript; only normalize obvious label separators.
  const text = tidy(
    optionsBlob
      .replace(/\bOr\s+D\b/gi, " D ")
      .replace(/\bIs it\b/gi, " ")
      .replace(/\s+/g, " "),
  );

  // Find standalone A/B/C/D labels.
  const re = /(^|[^A-Za-z])([A-D])(?:[\.\),:\-]\s*|\s+)/g;
  const marks = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    marks.push({ label: m[2].toUpperCase(), start: re.lastIndex, index: m.index });
  }

  if (marks.length < 4) return null;

  // Keep the first A/B/C/D in appearance order.
  const ordered = [];
  const seen = new Set();
  for (const mark of marks.sort((a, b) => a.index - b.index)) {
    if (seen.has(mark.label)) continue;
    seen.add(mark.label);
    ordered.push(mark);
    if (ordered.length === 4) break;
  }
  if (ordered.length < 4) return null;

  const options = {};
  for (let i = 0; i < ordered.length; i += 1) {
    const label = ordered[i].label;
    const start = ordered[i].start;
    const end = i + 1 < ordered.length ? ordered[i + 1].index : text.length;
    const value = tidy(text.slice(start, end));
    if (!value) return null;
    options[label] = value;
  }

  return options.A && options.B && options.C && options.D ? options : null;
}

const raw = fs.readFileSync(INPUT_PATH, "utf8");
const lines = raw
  .split(/\r?\n/)
  .map(cleanLine)
  .filter((line) => line.length > 0);

let chapter = "Google AI Essentials";
const questions = [];

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];

  if (/^chapter\s+\d+/i.test(line)) {
    chapter = line;
    continue;
  }

  if (!/the answer is/i.test(line)) continue;

  // Find nearest "Is it ... A ... B ... C ... D ..." block.
  let isItIdx = -1;
  for (let j = i - 1; j >= 0 && i - j <= 12; j -= 1) {
    if (/is it/i.test(lines[j])) {
      isItIdx = j;
      break;
    }
  }
  if (isItIdx === -1) continue;

  // Question stem is text before "Is it", with optional carry from previous line.
  const pre = tidy(lines[isItIdx].split(/is it/i)[0] || "");
  let stem = pre;
  const prev = lines[isItIdx - 1] ? tidy(lines[isItIdx - 1]) : "";
  const shouldPrependPrev =
    (stem.length < 28 || /^[a-z]/.test(stem)) &&
    !!prev &&
    !/the answer is/i.test(prev) &&
    !/^chapter\s+\d+/i.test(prev);

  if (shouldPrependPrev) {
    stem = tidy(`${prev} ${stem}`);
  }

  if (!stem.endsWith("?")) {
    if (!stem.endsWith("?")) stem = `${stem}?`;
  }
  if (stem.length < 12) continue;

  const optionsBlob = lines.slice(isItIdx, i).join(" ");
  const options = extractOptions(optionsBlob);
  if (!options) continue;

  const answerLetter = line.match(/the answer is\s*([A-D])\b/i)?.[1]?.toUpperCase();
  if (!answerLetter) continue;
  const correctAnswer = options[answerLetter];
  if (!correctAnswer) continue;

  const optionList = [options.A, options.B, options.C, options.D].map((o) => tidy(o));
  // Skip contaminated parses where options contain full question stems or unusable fragments.
  const isContaminated = optionList.some((opt) => {
    const n = normalize(opt);
    if (!n || n.length < 2) return true;
    if (opt.length > 140) return true;
    if (/\b(what|which|how|why|who)\b/i.test(opt) && opt.length > 24) return true;
    if (normalize(stem).includes(n) || n.includes(normalize(stem).slice(0, 24))) return true;
    return false;
  });
  if (isContaminated) continue;

  const explanationParts = [];
  for (let k = i + 1; k <= i + 2 && k < lines.length; k += 1) {
    const next = lines[k];
    if (!next) continue;
    if (/^chapter\s+\d+/i.test(next)) break;
    if (/is it/i.test(next)) break;
    if (/the answer is/i.test(next)) break;
    if (/like and subscribe|thanks for watching|sync to video time/i.test(next)) break;
    explanationParts.push(next);
  }

  const explanation =
    tidy(explanationParts.join(" ")) ||
    "Review this concept in your Google AI Essentials notes.";

  questions.push({
    id: `google_ai_transcript_${String(questions.length + 1).padStart(3, "0")}`,
    questionText: stem,
    questionType: "multiple_choice",
    correctAnswer,
    category: inferCategory(chapter),
    difficulty: "adaptive",
    options: optionList,
    explanation,
    remediationNotes:
      "Re-read the matching section in your transcript and verify why the other options are incorrect.",
    learningObjective: `Master exam recall for: ${chapter}`,
    tags: ["google-ai-essentials", "transcript-derived", inferCategory(chapter)],
  });
}

// Keep transcript wording intact; only remove exact duplicate stems.
const deduped = [];
const seen = new Set();
for (const q of questions) {
  const key = normalize(q.questionText);
  if (!key || seen.has(key)) continue;
  seen.add(key);
  deduped.push(q);
}

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(deduped, null, 2)}\n`, "utf8");

console.log(`Input: ${INPUT_PATH}`);
console.log(`Output: ${OUTPUT_PATH}`);
console.log(`Extracted strict questions: ${deduped.length}`);
