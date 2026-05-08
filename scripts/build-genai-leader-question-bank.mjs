import fs from "node:fs";
import path from "node:path";

const INPUT_PATH =
  process.argv[2] ||
  "C:/Users/illpr/Downloads/GOOGLE GENERATIVE AI LEADER EXAM.txt";
const OUTPUT_PATH =
  process.argv[3] ||
  "C:/Users/illpr/Desktop/VIBE CODING PROJECTS/AI STUDY GAME WINDOWS 11/public/questions/google_generative_ai_leader_questions.json";

const CERT_TAG = "google-generative-ai-leader";
const CERT_NAME = "Google Generative AI Leader";

function stripTimeNoise(text) {
  return String(text)
    .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\d*\b/g, " ")
    .replace(/\b\d+\s*(?:hours|minutes|seconds|hour|minute|second)(?=[A-Za-z])?/gi, " ")
    .replace(/\b(?:hours|minutes|seconds|hour|minute|second)(?=[A-Z])/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanLine(raw) {
  let line = String(raw).replace(/\uFEFF/g, "").trim();
  if (!line) return "";

  line = line.replace(/^\d{1,2}:\d{2,3}(?::\d{2})?\s*/, "");
  let prev = "";
  while (line !== prev) {
    prev = line;
    line = line
      .replace(/^\d+\s*(?:hour|hours|minute|minutes|second|seconds),?\s*/i, "")
      .replace(/^(?:hour|hours|minute|minutes|second|seconds),?\s*/i, "")
      .replace(/^\d+\s*,\s*/, "");
  }

  return line.replace(/\s+/g, " ").trim();
}

function tidy(text) {
  return stripTimeNoise(text)
    .replace(/^\d{1,3}\s+/, "")
    .replace(/\bs,\s*s\b/gi, " ")
    .replace(/\bs,\s*/gi, " ")
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
  if (c.includes("fundamental") || c.includes("definition")) return "fundamentals";
  if (c.includes("llm") || c.includes("token") || c.includes("pre training"))
    return "ai-terminology";
  if (c.includes("transformer") || c.includes("attention") || c.includes("positional"))
    return "generative-models";
  if (c.includes("diffusion")) return "generative-models";
  if (c.includes("ethic") || c.includes("risk") || c.includes("bias")) return "bias-fairness";
  return "fundamentals";
}

function extractOptions(optionsBlob) {
  const text = tidy(
    optionsBlob
      .replace(/\bIs it\b/gi, " ")
      .replace(/\bOr\s+D\b/gi, " D ")
      .replace(/\s+/g, " "),
  );

  const re = /(^|[^A-Za-z])([A-D])(?:[\.\),:\-]\s*|\s+)/g;
  const marks = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    marks.push({ label: m[2].toUpperCase(), index: m.index, start: re.lastIndex });
  }
  if (marks.length < 4) return null;

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
  .map((line) => tidy(cleanLine(line)))
  .filter((line) => line.length > 0);

let chapter = CERT_NAME;
const questions = [];

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  if (/^chapter\s+\d+/i.test(line)) {
    chapter = line;
    continue;
  }

  if (!/the\s+(?:correct\s+)?answer is/i.test(line)) continue;

  let isItIdx = -1;
  for (let j = i - 1; j >= 0 && i - j <= 12; j -= 1) {
    if (/is it/i.test(lines[j])) {
      isItIdx = j;
      break;
    }
  }
  if (isItIdx === -1) continue;

  const pre = tidy(lines[isItIdx].split(/is it/i)[0] || "");
  let stem = pre;
  const prev = lines[isItIdx - 1] ? tidy(lines[isItIdx - 1]) : "";
  if ((stem.length < 30 || /^[a-z]/.test(stem)) && prev && !/^chapter\s+\d+/i.test(prev)) {
    stem = tidy(`${prev} ${stem}`);
  }
  if (!stem.endsWith("?")) stem = `${stem}?`;
  if (stem.length < 12) continue;
  if (/birdsy|subscribe|link in the description|sync to video time/i.test(stem)) continue;

  const optionsBlob = lines.slice(isItIdx, i).join(" ");
  const options = extractOptions(optionsBlob);
  if (!options) continue;

  const answerLetter = line
    .match(/the\s+(?:correct\s+)?answer is\s*([A-D])\b/i)?.[1]
    ?.toUpperCase();
  if (!answerLetter || !options[answerLetter]) continue;

  const optionList = [options.A, options.B, options.C, options.D].map((o) => tidy(o));
  const correctAnswer = tidy(options[answerLetter]);

  // Keep only clean parses; do not synthesize/fallback.
  const contaminated = optionList.some((opt) => {
    const n = normalize(opt);
    if (!n || opt.length > 160) return true;
    if (/\b(what|which|how|why|who)\b/i.test(opt) && opt.length > 28) return true;
    if (/birdsy|subscribe|link in the description|sync to video time/i.test(opt)) return true;
    return false;
  });
  if (contaminated) continue;

  const explanationParts = [];
  for (let k = i + 1; k <= i + 2 && k < lines.length; k += 1) {
    const next = lines[k];
    if (!next) continue;
    if (/^chapter\s+\d+/i.test(next)) break;
    if (/is it/i.test(next)) break;
    if (/the\s+(?:correct\s+)?answer is/i.test(next)) break;
    if (/subscribe|birdsy|link in the description|sync to video time/i.test(next)) break;
    explanationParts.push(next);
  }

  questions.push({
    id: `google_genai_leader_${String(questions.length + 1).padStart(3, "0")}`,
    questionText: stem,
    questionType: "multiple_choice",
    correctAnswer,
    category: inferCategory(chapter),
    difficulty: "adaptive",
    options: optionList,
    explanation:
      tidy(explanationParts.join(" ")) ||
      "Review the related concept in your Google Generative AI Leader notes.",
    remediationNotes:
      "Review this exact question context in your transcript and contrast each distractor with the correct answer.",
    learningObjective: `Master ${CERT_NAME} concept: ${chapter}`,
    tags: [CERT_TAG, "transcript-derived", inferCategory(chapter)],
  });
}

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
