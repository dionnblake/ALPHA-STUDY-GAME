import fs from "node:fs";
import path from "node:path";

const TRACK_FILES = [
  "public/questions/google_ai_essentials_transcript_questions.json",
  "public/questions/google_ai_professional_cert.json",
  "public/questions/prompt_engineering_full_course_questions.json",
  "public/questions/google_generative_ai_leader_questions.json",
];

const STOPWORDS = new Set([
  "the",
  "and",
  "that",
  "with",
  "from",
  "this",
  "which",
  "what",
  "when",
  "where",
  "how",
  "why",
  "into",
  "about",
  "option",
  "best",
  "answer",
  "for",
  "your",
  "their",
  "they",
  "them",
  "have",
  "has",
  "had",
  "will",
  "would",
  "could",
  "should",
  "using",
  "used",
  "use",
  "are",
  "is",
  "was",
  "were",
  "can",
  "you",
  "its",
  "it",
  "in",
  "on",
  "to",
  "of",
  "by",
  "as",
  "an",
  "a",
]);

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return normalize(text)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 4 && !STOPWORDS.has(token));
}

function categoryLabel(category) {
  return String(category || "general ai knowledge")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCorrectText(question) {
  if (typeof question.correctAnswer === "string" && question.correctAnswer.trim()) {
    return question.correctAnswer.trim();
  }
  if (typeof question.correct_answer === "string" && question.correct_answer.trim()) {
    return question.correct_answer.trim();
  }
  return "";
}

function isLikelyLeak(question) {
  const qText = String(question.questionText || question.question_text || "");
  const answer = getCorrectText(question);
  if (!qText || !answer) return false;

  const qNorm = normalize(qText);
  const aNorm = normalize(answer);
  const aTokens = tokenize(answer);
  const qTokens = new Set(tokenize(qText));
  const overlaps = aTokens.filter((token) => qTokens.has(token)).length;
  const overlapRatio = aTokens.length ? overlaps / aTokens.length : 0;
  const isGenerated = Array.isArray(question.tags) && question.tags.includes("generated-variant");

  const fullAnswerLeak =
    aNorm.length >= 8 &&
    qNorm.includes(aNorm) &&
    (aNorm.split(" ").length >= 2 || aNorm.length >= 14);

  const heavyTokenLeak = aTokens.length >= 2 && overlapRatio >= 0.8;
  const generatedTokenLeak = isGenerated && aTokens.length >= 2 && overlapRatio >= 0.5;

  return fullAnswerLeak || heavyTokenLeak || generatedTokenLeak;
}

function makeSafeStem(question, index) {
  const category = categoryLabel(question.category);
  const objective = String(question.learningObjective || "").trim();
  const objectiveShort = objective.replace(/\s+/g, " ").slice(0, 90).trim();

  if (objectiveShort) {
    return `Item ${index}: Which option best matches this ${category} concept from the current learning objective?`;
  }

  return `Item ${index}: Which option best fits this ${category} review concept?`;
}

function loadQuestions(filePath) {
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (Array.isArray(parsed)) return { wrapper: null, items: parsed };
  if (parsed && Array.isArray(parsed.questions)) return { wrapper: parsed, items: parsed.questions };
  return { wrapper: null, items: [] };
}

function saveQuestions(filePath, wrapper, items) {
  const output = wrapper ? { ...wrapper, questions: items } : items;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
}

for (const filePath of TRACK_FILES) {
  const { wrapper, items } = loadQuestions(filePath);
  let updated = 0;

  const next = items.map((question, i) => {
    if (!isLikelyLeak(question)) return question;
    updated += 1;
    return {
      ...question,
      questionText: makeSafeStem(question, i + 1),
      question_text: makeSafeStem(question, i + 1),
    };
  });

  saveQuestions(filePath, wrapper, next);
  console.log(`${filePath}: patched=${updated} total=${items.length}`);
}
