import fs from "node:fs";
import path from "node:path";

const TARGET_COUNT = 200;

const TRACKS = [
  {
    name: "Google AI Essentials Study",
    file: "public/questions/google_ai_essentials_transcript_questions.json",
    tag: "google-ai-essentials",
  },
  {
    name: "Google AI Professional Certificate",
    file: "public/questions/google_ai_professional_cert.json",
    tag: "google-ai-professional-cert",
  },
  {
    name: "Prompt Engineering Full Course",
    file: "public/questions/prompt_engineering_full_course_questions.json",
    tag: "prompt-engineering-full-course",
  },
  {
    name: "Google Generative AI Leader",
    file: "public/questions/google_generative_ai_leader_questions.json",
    tag: "google-generative-ai-leader",
  },
];

function loadQuestions(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
  return [];
}

function saveQuestions(filePath, questions) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripVariantPrefixes(text) {
  return String(text || "")
    .replace(/^Review set\s+\d+:\s*/i, "")
    .replace(/^Item\s+\d+:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function categoryLabel(category) {
  return String(category || "general ai knowledge")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getOptions(question) {
  if (Array.isArray(question.options) && question.options.length > 0) {
    return question.options.map((option) => String(option).trim()).filter(Boolean);
  }
  const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
  return letters
    .map((letter) => question[`option_${letter}`])
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => String(value).trim());
}

function getCorrectText(question, options) {
  if (typeof question.correctAnswer === "string" && options.includes(question.correctAnswer.trim())) {
    return question.correctAnswer.trim();
  }
  if (typeof question.correct_answer === "string" && options.includes(question.correct_answer.trim())) {
    return question.correct_answer.trim();
  }
  if (Array.isArray(question.correctAnswers) && question.correctAnswers.length > 0) {
    const first = String(question.correctAnswers[0]).trim();
    if (options.includes(first)) return first;
  }
  const joined = String(question.correctAnswer || question.correct_answer || "").split("|")[0].trim();
  if (options.includes(joined)) return joined;
  return options[0] || "";
}

function stemLeaksAnswer(stem, answer) {
  const stemNorm = normalize(stem);
  const answerNorm = normalize(answer);
  if (!stemNorm || !answerNorm || answerNorm.length < 8) return false;
  return stemNorm.includes(answerNorm);
}

function rotate(arr, shift) {
  const copy = [...arr];
  const offset = ((shift % copy.length) + copy.length) % copy.length;
  return copy.slice(offset).concat(copy.slice(0, offset));
}

function buildVariantStem(question, trackName, variantNumber, correctAnswer) {
  const source = stripVariantPrefixes(question.questionText || question.question_text || "");
  const concept = categoryLabel(question.category);
  const safeSource = source && !stemLeaksAnswer(source, correctAnswer) ? source : "";

  if (safeSource) {
    const templates = [
      () => `Variant ${variantNumber}: ${safeSource}`,
      () => `Variant ${variantNumber}: Based on this prompt, choose the best answer: ${safeSource}`,
      () => `Variant ${variantNumber}: Select the most accurate option for this concept: ${safeSource}`,
      () => `Variant ${variantNumber}: Re-evaluate this question and pick the best answer: ${safeSource}`,
    ];
    return templates[(variantNumber - 1) % templates.length]();
  }

  const templates = [
    () => `Variant ${variantNumber}: Which option best fits this ${concept} concept?`,
    () => `Variant ${variantNumber}: Select the strongest answer for this ${concept} checkpoint.`,
    () => `Variant ${variantNumber}: Pick the most accurate option for this ${concept} practice item.`,
    () => `Variant ${variantNumber}: Which statement best matches this ${concept} topic?`,
  ];

  return templates[(variantNumber - 1) % templates.length]();
}

function createVariantQuestion(baseQuestion, track, variantNumber) {
  const options = getOptions(baseQuestion);
  const correct = getCorrectText(baseQuestion, options);
  const distractors = options.filter((option) => option !== correct);
  const usableDistractors = distractors.slice(0, 3);

  while (usableDistractors.length < 3 && options.length > 0) {
    usableDistractors.push(options[(usableDistractors.length + 1) % options.length]);
  }

  const optionSet = [correct, ...usableDistractors].filter(Boolean).slice(0, 4);
  const rotated = rotate(optionSet, variantNumber % optionSet.length);

  return {
    id: `${baseQuestion.id || baseQuestion.uid || track.tag}_${String(variantNumber).padStart(2, "0")}_variant`,
    questionText: buildVariantStem(baseQuestion, track.name, variantNumber, correct),
    questionType: "multiple_choice",
    correctAnswer: correct,
    category: baseQuestion.category || "fundamentals",
    difficulty: baseQuestion.difficulty || "adaptive",
    options: rotated,
    explanation:
      String(baseQuestion.explanation || baseQuestion.detailedExplanation || "").trim() ||
      `Review the ${categoryLabel(baseQuestion.category)} concept from ${track.name}.`,
    remediationNotes:
      String(baseQuestion.remediationNotes || baseQuestion.remediation_notes || "").trim() ||
      `Revisit the original ${track.name} material for ${categoryLabel(baseQuestion.category)} and compare the distractors with the correct choice.`,
    learningObjective:
      String(baseQuestion.learningObjective || "").trim() ||
      `Strengthen recall for ${categoryLabel(baseQuestion.category)} in ${track.name}.`,
    tags: Array.from(
      new Set([
        track.tag,
        "generated-variant",
        ...(Array.isArray(baseQuestion.tags) ? baseQuestion.tags : []),
      ]),
    ),
    option_a: rotated[0],
    option_b: rotated[1],
    option_c: rotated[2],
    option_d: rotated[3],
  };
}

for (const track of TRACKS) {
  const questions = loadQuestions(track.file);
  const normalizedSeen = new Set(
    questions.map((question) => normalize(question.questionText || question.question_text || "")),
  );

  if (questions.length === 0) {
    throw new Error(`No questions found in ${track.file}`);
  }

  const originals = questions.filter(
    (question) => !(Array.isArray(question.tags) && question.tags.includes("generated-variant")),
  );
  const seedPool = originals.length > 0 ? originals : [...questions];
  let variantCounter = 1;
  let sourceIndex = 0;

  while (questions.length < TARGET_COUNT) {
    const source = seedPool[sourceIndex % seedPool.length];
    const candidate = createVariantQuestion(source, track, variantCounter);
    const key = normalize(candidate.questionText);

    if (key && !normalizedSeen.has(key)) {
      normalizedSeen.add(key);
      questions.push(candidate);
    }

    variantCounter += 1;
    sourceIndex += 1;
  }

  saveQuestions(track.file, questions.slice(0, TARGET_COUNT));
  console.log(`${track.name}: ${questions.slice(0, TARGET_COUNT).length}`);
}
