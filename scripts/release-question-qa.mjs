import fs from "node:fs";
import path from "node:path";

const QUESTIONS_DIR = "public/questions";

const REQUIRED_TRACK_COUNTS = [
  {
    name: "Google AI Essentials Study",
    file: "google_ai_essentials_transcript_questions.json",
    expected: 200,
  },
  {
    name: "Google AI Professional Certificate",
    file: "google_ai_professional_cert.json",
    expected: 200,
  },
  {
    name: "Prompt Engineering Full Course",
    file: "prompt_engineering_full_course_questions.json",
    expected: 200,
  },
  {
    name: "Google Generative AI Leader",
    file: "google_generative_ai_leader_questions.json",
    expected: 200,
  },
];

const LEAK_FILES = new Set(REQUIRED_TRACK_COUNTS.map((track) => track.file));
const REQUIRED_FILES = new Set(REQUIRED_TRACK_COUNTS.map((track) => track.file));

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function loadItems(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
  return [];
}

function getQuestionText(question) {
  return String(question.questionText || question.question_text || "").trim();
}

function getQuestionTextLegacy(question) {
  return String(question.question_text || "").trim();
}

function getCorrectAnswer(question) {
  return String(question.correctAnswer || question.correct_answer || "").trim();
}

function hasTruncation(text) {
  return /â€¦|…|\.{3,}/.test(String(text || ""));
}

function hasFullAnswerLeak(question) {
  const qText = getQuestionText(question);
  const answer = getCorrectAnswer(question);
  if (!qText || !answer) return false;

  const qNorm = normalize(qText);
  const aNorm = normalize(answer);
  if (aNorm.length < 8) return false;

  return qNorm.includes(aNorm);
}

function optionMismatch(question) {
  const answer = getCorrectAnswer(question);
  const options = Array.isArray(question.options)
    ? question.options.map((opt) => String(opt || "").trim()).filter(Boolean)
    : [];
  if (!answer || options.length === 0) return false;
  const aNorm = normalize(answer);
  return !options.some((opt) => normalize(opt) === aNorm);
}

function rel(filePath) {
  return path.relative(process.cwd(), filePath).replace(/\\/g, "/");
}

const files = Array.from(REQUIRED_FILES).map((name) => path.join(QUESTIONS_DIR, name));

const failures = [];

for (const filePath of files) {
  const fileName = path.basename(filePath);
  const items = loadItems(filePath);

  let truncQuestionText = 0;
  let truncLegacyText = 0;
  let fullAnswerLeaks = 0;
  let optionMismatches = 0;

  for (const question of items) {
    if (hasTruncation(getQuestionText(question))) truncQuestionText += 1;
    if (hasTruncation(getQuestionTextLegacy(question))) truncLegacyText += 1;
    if (LEAK_FILES.has(fileName) && hasFullAnswerLeak(question)) fullAnswerLeaks += 1;
    if (optionMismatch(question)) optionMismatches += 1;
  }

  if (truncQuestionText > 0) {
    failures.push(`${rel(filePath)} has ${truncQuestionText} truncated questionText entries`);
  }
  if (truncLegacyText > 0) {
    failures.push(`${rel(filePath)} has ${truncLegacyText} truncated question_text entries`);
  }
  if (LEAK_FILES.has(fileName) && fullAnswerLeaks > 0) {
    failures.push(`${rel(filePath)} has ${fullAnswerLeaks} full-answer leaks`);
  }
  if (optionMismatches > 0) {
    failures.push(`${rel(filePath)} has ${optionMismatches} correctAnswer/option mismatches`);
  }

  console.log(
    `${rel(filePath)}: total=${items.length} trunc(questionText)=${truncQuestionText} trunc(question_text)=${truncLegacyText}` +
      (LEAK_FILES.has(fileName) ? ` full-answer-leaks=${fullAnswerLeaks}` : "") +
      ` answer-option-mismatch=${optionMismatches}`,
  );
}

for (const track of REQUIRED_TRACK_COUNTS) {
  const filePath = path.join(QUESTIONS_DIR, track.file);
  const items = loadItems(filePath);
  if (items.length !== track.expected) {
    failures.push(
      `${rel(filePath)} has ${items.length} questions (expected ${track.expected}) for ${track.name}`,
    );
  }
}

if (failures.length > 0) {
  console.error("\nRelease question QA failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("\nRelease question QA passed.");
