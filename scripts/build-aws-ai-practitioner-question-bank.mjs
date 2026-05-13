import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = "C:/Users/illpr/Desktop/VIBE CODING PROJECTS/AI STUDY GAME WINDOWS 11";
const INPUT_PATH = "C:/Users/illpr/Downloads/AWS certified practitioner.txt";
const OUTPUT_PATH = path.join(PROJECT_ROOT, "public/questions/aws_certified_ai_practitioner_questions.json");
const TRACK_TAG = "aws-certified-ai-practitioner";
const TRACK_NAME = "AWS Certified AI Practitioner";

const categoryByChapter = {
  1: "aws-ai-ml-fundamentals",
  2: "aws-learning-types",
  3: "aws-model-lifecycle",
  4: "aws-model-performance",
  5: "aws-sagemaker",
  6: "aws-ai-services",
  7: "aws-generative-ai",
  8: "aws-data-services",
  9: "aws-llm-concepts",
  10: "aws-prompt-engineering",
  11: "aws-nlp-techniques",
  12: "aws-model-customization",
  13: "aws-responsible-ai",
  14: "aws-data-privacy",
  15: "aws-ai-security",
  16: "aws-security-model",
  17: "aws-ai-use-cases",
  18: "aws-data-preparation",
  19: "aws-model-deployment",
  20: "aws-mlops-lifecycle",
};

const categoryFallbackOptions = {
  "aws-ai-ml-fundamentals": ["training", "inference", "deployment", "labeling", "feature engineering", "data warehousing"],
  "aws-learning-types": ["supervised learning", "unsupervised learning", "reinforcement learning", "transfer learning", "semi-supervised learning", "batch learning"],
  "aws-model-lifecycle": ["training data set", "validation data set", "test data set", "inference", "hyperparameter tuning", "distribution shift"],
  "aws-model-performance": ["overfitting", "underfitting", "generalization", "regularization", "low training accuracy", "high validation accuracy"],
  "aws-sagemaker": ["Amazon SageMaker", "SageMaker endpoint", "training job", "batch transform job", "hyperparameter tuning job", "SageMaker notebook instance"],
  "aws-ai-services": ["Amazon Rekognition", "Amazon Transcribe", "Amazon Polly", "Amazon Translate", "Amazon Textract", "Amazon Comprehend"],
  "aws-generative-ai": ["Amazon Bedrock", "Amazon Lex", "foundation model", "fine-tuning", "knowledge base", "guardrail"],
  "aws-data-services": ["Amazon S3", "Amazon DynamoDB", "AWS Glue", "Amazon Kinesis Data Streams", "Amazon Redshift", "Amazon RDS"],
  "aws-llm-concepts": ["attention mechanism", "tokens", "context window", "pre-training", "embedding", "decoding strategy"],
  "aws-prompt-engineering": ["system prompt", "prompt chaining", "zero-shot prompting", "few-shot prompting", "prompt injection", "prompt template"],
  "aws-nlp-techniques": ["tokenization", "embedding", "sentiment analysis", "named entity recognition", "semantic meaning", "language understanding"],
  "aws-model-customization": ["fine-tuning", "transfer learning", "pre-training", "domain adaptation", "labeled data", "model weights"],
  "aws-responsible-ai": ["fairness", "bias detection", "explainability", "transparency", "human oversight", "accountability"],
  "aws-data-privacy": ["data minimization", "consent", "encryption", "anonymization", "GDPR", "data retention"],
  "aws-ai-security": ["prompt injection", "adversarial attack", "robustness", "guardrail", "model vulnerability", "input validation"],
  "aws-security-model": ["IAM", "shared responsibility model", "least privilege", "AWS KMS", "VPC endpoint", "security group"],
  "aws-ai-use-cases": ["recommendation engine", "sentiment analysis", "speech-to-text conversion", "image recognition", "fraud detection", "chatbot"],
  "aws-data-preparation": ["data labeling", "feature engineering", "schema inference", "data normalization", "categorical encoding", "data shuffling"],
  "aws-model-deployment": ["real-time endpoint", "asynchronous endpoint", "streaming endpoint", "model monitoring", "invocation latency", "data drift"],
  "aws-mlops-lifecycle": ["model deployment", "model monitoring", "model training", "automation", "retraining", "data encryption"],
};

const acronymExpansions = new Map([
  ["AWS", "AWS (Amazon Web Services)"],
  ["AI", "AI (Artificial Intelligence)"],
  ["ML", "ML (Machine Learning)"],
  ["NLP", "NLP (Natural Language Processing)"],
  ["LLM", "LLM (Large Language Model)"],
  ["LLMs", "LLMs (Large Language Models)"],
  ["RAG", "RAG (Retrieval-Augmented Generation)"],
  ["IAM", "IAM (Identity and Access Management)"],
  ["PII", "PII (Personally Identifiable Information)"],
  ["API", "API (Application Programming Interface)"],
  ["APIs", "APIs (Application Programming Interfaces)"],
  ["ETL", "ETL (Extract, Transform, Load)"],
  ["IoT", "IoT (Internet of Things)"],
  ["S3", "S3 (Simple Storage Service)"],
  ["GDPR", "GDPR (General Data Protection Regulation)"],
  ["PCA", "PCA (Principal Component Analysis)"],
  ["KNN", "KNN (K-Nearest Neighbors)"],
  ["SVM", "SVM (Support Vector Machine)"],
  ["FM", "FM (Foundation Model)"],
  ["FMs", "FMs (Foundation Models)"],
  ["ROUGE", "ROUGE (Recall-Oriented Understudy for Gisting Evaluation)"],
  ["MLOps", "MLOps (Machine Learning Operations)"],
]);

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function cleanLine(line) {
  return line
    .replace(/^\uFEFF/, "")
    .replace(/^\d+:\d{2}:\d{2}\s*/, "")
    .replace(/^\d+:\d{2}\s*/, "")
    .replace(/^\d+\s*(?:hours?|minutes?|seconds?)(?:,\s*\d+\s*(?:minutes?|seconds?))?/i, "")
    .replace(/^\d+\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\bBirds?ie\b/gi, "Birdsy")
    .replace(/\bspeechtoext\b/gi, "speech-to-text")
    .replace(/\btexttospech\b/gi, "text-to-speech")
    .replace(/\btext to speech\b/gi, "text-to-speech")
    .replace(/\bvoice to text\b/gi, "speech-to-text")
    .replace(/\bDynamob\b/gi, "DynamoDB")
    .replace(/\bPoly\b/g, "Polly")
    .replace(/\bSage Maker\b/g, "SageMaker")
    .replace(/\brecognization\b/gi, "Rekognition")
    .replace(/\brecognition\b/gi, "Rekognition")
    .replace(/\btext ?tract\b/gi, "Textract")
    .replace(/\bcomprehend\b/gi, "Comprehend")
    .replace(/\bholucination\b/gi, "hallucination")
    .replace(/\bgen ?ai\b/gi, "GenAI")
    .replace(/\b\d+\s*(?:hours?|minutes?|seconds?)(?:,\s*\d+\s*(?:minutes?|seconds?))*/gi, "")
    .replace(/,\s*\d+\s*seconds?/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([?.!,])/g, "$1")
    .trim();
}

function expandAcronyms(value) {
  let out = String(value ?? "");
  for (const [acronym, expanded] of acronymExpansions) {
    const escaped = acronym.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`\\b${escaped}\\b(?!\\s*\\()`, "g"), expanded);
  }
  return out;
}

function optionClean(value) {
  return expandAcronyms(cleanText(value)
    .replace(/^is it\s+/i, "")
    .replace(/^or\s+/i, "")
    .replace(/^option\s+[A-D]\s*/i, "")
    .replace(/^[A-D](?:[.)]|\\s+)/i, "")
    .replace(/[?.]+$/g, "")
    .replace(/,$/, "")
    .trim());
}

function parseOptions(source, correctLetter, answerText, category) {
  let s = ` ${source} `
    .replace(/\bIs it\s+a\b/gi, " A")
    .replace(/([\s,?;.])b\b/gi, "$1B")
    .replace(/([\s,?;.])c\b/gi, "$1C")
    .replace(/\b(?:or|Or)\s+d\b/g, " D")
    .replace(/\bOr\s+([ABCD])[.)]?/g, " $1 ")
    .replace(/\bor\s+([ABCD])[.)]?/g, " $1 ")
    .replace(/\bIs it\s+/i, " ");
  const marks = [];
  const re = /[\s,?;.]([ABCD])[.)]?\s+/g;
  let match;
  while ((match = re.exec(s))) {
    marks.push({ letter: match[1].toUpperCase(), index: match.index + 1, end: re.lastIndex });
  }

  const byLetter = {};
  for (let i = 0; i < marks.length; i += 1) {
    const end = i + 1 < marks.length ? marks[i + 1].index : s.length;
    const value = optionClean(s.slice(marks[i].end, end));
    if (value && !byLetter[marks[i].letter] && value.length < 100 && !/\b(?:wrong answer|wrong choice|right answer|right choice|let us|moving to|not talking|strike out|eliminated|now we|left out)\b/i.test(value)) byLetter[marks[i].letter] = value;
  }

  if (!byLetter[correctLetter] && answerText) byLetter[correctLetter] = optionClean(answerText);

  const fallback = categoryFallbackOptions[category] ?? categoryFallbackOptions["aws-ai-ml-fundamentals"];
  let fallbackIndex = 0;
  for (const letter of ["A", "B", "C", "D"]) {
    while (!byLetter[letter] && fallbackIndex < fallback.length) {
      const candidate = optionClean(fallback[fallbackIndex]);
      fallbackIndex += 1;
      if (!Object.values(byLetter).includes(candidate)) byLetter[letter] = candidate;
    }
  }

  return ["A", "B", "C", "D"].map((letter) => byLetter[letter] || optionClean(`${letter} option from source transcript`));
}

function answerTextFromPost(post, markerText) {
  const after = post.slice(markerText.length).trim();
  return cleanText((after.match(/^([^.?]+)[.?]/)?.[1] || after.split(/\s+(?:Why|This|A|An|The|For|In|So)\b/)[0] || "").trim());
}

function makeQuestion({ sourceId, questionText, options, correctLetter, explanation, category, chapter, review = false }) {
  const uid = `aws_ai_practitioner_${sourceId}${review ? "_review" : ""}`;
  const normalizedOptions = options.map(optionClean);
  return {
    id: uid,
    uid,
    questionText: expandAcronyms(cleanText(questionText)),
    question_type: "multiple_choice",
    questionType: "multiple_choice",
    correct_answer: correctLetter,
    correctAnswer: correctLetter,
    category,
    difficulty: "adaptive",
    options: normalizedOptions,
    option_a: normalizedOptions[0],
    option_b: normalizedOptions[1],
    option_c: normalizedOptions[2],
    option_d: normalizedOptions[3],
    explanation: expandAcronyms(cleanText(explanation)),
    learningObjective: `${TRACK_NAME}: ${chapter}`,
    tags: [TRACK_TAG, slug(chapter), category, review ? "source-review-repeat" : "source-transcript"],
  };
}

function buildBirdsyQuestions(lines) {
  const start = lines.findIndex((line) => /^Chapter\s+1:/i.test(line));
  const useful = lines.slice(start);
  const chapters = [];
  let current = null;
  for (const line of useful) {
    const match = line.match(/^Chapter\s+(\d+):\s*(.+)$/i);
    if (match) {
      current = { number: Number(match[1]), title: match[2], lines: [] };
      chapters.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }

  const questions = [];
  for (const chapter of chapters) {
    const category = categoryByChapter[chapter.number] ?? "aws-ai-ml-fundamentals";
    const text = cleanText(chapter.lines.join(" "));
    const markers = [...text.matchAll(/The correct answer is\s+([A-D])\b[.)?,]?\s*/gi)];
    let previousMarkerEnd = 0;
    for (let i = 0; i < markers.length; i += 1) {
      const marker = markers[i];
      const nextMarkerIndex = i + 1 < markers.length ? markers[i + 1].index : text.length;
      const pre = text.slice(previousMarkerEnd, marker.index).trim();
      const post = text.slice(marker.index, Math.min(nextMarkerIndex, marker.index + 700)).trim();
      const correctLetter = marker[1].toUpperCase();
      const answerText = answerTextFromPost(post, marker[0]);
      let questionText = pre;
      const strongStarts = [...pre.matchAll(/\b(Which|What|Why|How|When|During|On AWS|A data scientist|A developer|An AWS|An Amazon|A company|A team|An organization|A business|A user|A customer|A bank|A healthcare|A financial|A retail|A marketing|A manufacturing|A researcher|A student)\b/gi)];
      if (strongStarts.length) questionText = pre.slice(strongStarts.at(-1).index).trim();
      questionText = questionText.replace(/\s*The correct answer.*$/i, "").trim();
      const options = parseOptions(questionText, correctLetter, answerText, category);
      const explanation = post || `The correct answer is ${correctLetter}. ${answerText}`;
      questions.push(makeQuestion({
        sourceId: `birdsy_${String(questions.length + 1).padStart(3, "0")}`,
        questionText,
        options,
        correctLetter,
        explanation,
        category,
        chapter: `Chapter ${chapter.number}: ${chapter.title}`,
      }));
      previousMarkerEnd = marker.index + marker[0].length;
    }
  }
  return questions;
}

function extractQuestionSentence(sectionText) {
  const text = cleanText(sectionText);
  const qStart = text.search(/Question number\s+\w+[,.-]?\s+/i);
  const sliced = qStart >= 0 ? text.slice(qStart).replace(/Question number\s+\w+[,.-]?\s+/i, "") : text;
  const stop = sliced.search(/\b(?:Let us|We have|The keyword|With this keyword|Now let us|I believe|One of the easiest|Hope you|If you remember)\b/i);
  const candidate = (stop > 0 ? sliced.slice(0, stop) : sliced).trim();
  return candidate.endsWith("?") ? candidate : `${candidate.replace(/[. ]+$/, "")}?`;
}

function inferSecondCorrect(sectionText) {
  const text = cleanText(sectionText);
  const patterns = [
    /option\s+([A-D])\s+(?:is\s+)?(?:a\s+)?(?:right|best)\s+(?:answer|choice)/i,
    /([A-D])\s+is\s+(?:a\s+)?(?:right|best)\s+(?:answer|choice)/i,
    /answer\s+is\s+([A-D])\b/i,
    /left out with option\s+([A-D])/i,
    /left out with\s+(?:a\s+)?([A-D])\b/i,
    /So\s+([A-D])\s+is\s+(?:a\s+)?right/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].toUpperCase();
  }
  return "A";
}

function inferAnswerPhrase(sectionText, correctLetter, title) {
  const text = cleanText(sectionText);
  const direct = [
    new RegExp(`option\\s+${correctLetter}[^.]{0,90}`, "i"),
    new RegExp(`${correctLetter}\\s+is\\s+(?:a\\s+)?(?:right|best)[^.]{0,100}`, "i"),
    /right choice is\s+([^.,]+)[.,]/i,
    /best option is\s+([^.,]+)[.,]/i,
    /best choice is\s+([^.,]+)[.,]/i,
  ];
  for (const pattern of direct) {
    const match = text.match(pattern);
    if (match) {
      const phrase = optionClean(match[1] ?? match[0]);
      if (phrase && phrase.length < 120 && !/right|choice|answer/i.test(phrase)) return phrase;
    }
  }
  const titleAnswer = title.replace(/^Amazon\s+/i, "Amazon ").split("-")[0].trim();
  return optionClean(titleAnswer);
}

function buildSecondTranscriptQuestions(lines) {
  const qIndexes = [];
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^Q(\d+):\s*(.+)$/i);
    if (match) qIndexes.push({ index: i, number: Number(match[1]), title: cleanText(match[2]) });
  }
  const categoryCycle = [
    "aws-sagemaker", "aws-model-customization", "aws-learning-types", "aws-data-services", "aws-ai-services",
    "aws-model-performance", "aws-responsible-ai", "aws-llm-concepts", "aws-llm-concepts", "aws-model-deployment",
    "aws-ai-services", "aws-prompt-engineering", "aws-model-performance", "aws-ai-services", "aws-generative-ai",
    "aws-data-services", "aws-learning-types", "aws-ai-ml-fundamentals", "aws-model-lifecycle", "aws-model-performance",
    "aws-model-performance", "aws-model-performance", "aws-model-performance", "aws-mlops-lifecycle", "aws-model-performance",
    "aws-model-lifecycle", "aws-llm-concepts", "aws-model-performance", "aws-data-preparation", "aws-model-performance",
    "aws-generative-ai", "aws-ai-services", "aws-ai-services", "aws-generative-ai", "aws-ai-security",
    "aws-responsible-ai", "aws-model-customization", "aws-security-model", "aws-llm-concepts", "aws-responsible-ai",
    "aws-prompt-engineering", "aws-prompt-engineering", "aws-model-performance", "aws-model-deployment", "aws-model-performance",
    "aws-ai-security", "aws-prompt-engineering", "aws-model-deployment", "aws-ai-services", "aws-ai-security",
  ];

  return qIndexes.map((entry, idx) => {
    const next = idx + 1 < qIndexes.length ? qIndexes[idx + 1].index : lines.length;
    const section = lines.slice(entry.index, next).join(" ");
    const category = categoryCycle[idx] ?? "aws-ai-ml-fundamentals";
    const questionText = extractQuestionSentence(section);
    const correctLetter = inferSecondCorrect(section);
    const answerPhrase = inferAnswerPhrase(section, correctLetter, entry.title);
    const options = parseOptions(section, correctLetter, answerPhrase, category);
    const correctedOptions = options.map((option, optionIndex) => {
      const letter = String.fromCharCode(65 + optionIndex);
      return letter === correctLetter && answerPhrase ? optionClean(answerPhrase) : option;
    });
    return makeQuestion({
      sourceId: `examwalk_${String(entry.number).padStart(3, "0")}`,
      questionText,
      options: correctedOptions,
      correctLetter,
      explanation: section.slice(0, 900),
      category,
      chapter: `Transcript Practice Q${entry.number}: ${entry.title}`,
    });
  });
}

const raw = fs.readFileSync(INPUT_PATH, "utf8");
const lines = raw.split(/\r?\n/).map(cleanLine).filter(Boolean).map(cleanText).filter(Boolean);
let questions = [...buildBirdsyQuestions(lines), ...buildSecondTranscriptQuestions(lines)].filter((question) =>
  question.questionText.length >= 30 &&
  !/^(?:and|during)\b/i.test(question.questionText) &&
  !question.options.some((option) => /\b(?:is also wrong|got automatically|^and$)\b/i.test(option))
);
const uniqueSourceCount = questions.length;
let reviewIndex = 0;
while (questions.length < 200) {
  const original = questions[reviewIndex % uniqueSourceCount];
  const clone = { ...original };
  const reviewUid = `aws_ai_practitioner_review_${String(reviewIndex + 1).padStart(3, "0")}`;
  clone.id = reviewUid;
  clone.uid = reviewUid;
  clone.tags = [...new Set([...(clone.tags ?? []), "source-review-repeat"])] ;
  questions.push(clone);
  reviewIndex += 1;
}

function sanitizeFinalQuestion(question) {
  const fallback = categoryFallbackOptions[question.category] ?? categoryFallbackOptions["aws-ai-ml-fundamentals"];
  const correctIndex = question.correctAnswer.charCodeAt(0) - 65;
  const badOption = (option) =>
    !option ||
    option.length > 110 ||
    /\b(?:wrong answer|wrong choice|right answer|right choice|let us|moving to|not talking|strike out|eliminated|now we|left out|option\s+[A-D])\b/i.test(option) ||
    /\b[BCD][,.)]\s/.test(option);

  let options = question.options.map((option) =>
    optionClean(option)
      .replace(/^,\s*/, "")
      .replace(/^A\s+Amazon\b/i, "Amazon")
      .replace(/^A\s+AWS\b/i, "AWS")
      .replace(/^ata\b/i, "data")
      .replace(/\?\s*B,.*$/i, "")
      .trim()
  );

  const answerFromExplanation = question.explanation.match(/The correct answer is\s+[A-D][.)?,]?\s*([^.?]+)/i)?.[1];
  if (badOption(options[correctIndex]) && answerFromExplanation) {
    options[correctIndex] = optionClean(answerFromExplanation);
  }

  let fallbackIndex = 0;
  for (let i = 0; i < options.length; i += 1) {
    while (
      (badOption(options[i]) || options.filter((value) => value === options[i]).length > 1) &&
      fallbackIndex < fallback.length
    ) {
      const candidate = optionClean(fallback[fallbackIndex]);
      fallbackIndex += 1;
      if (!options.includes(candidate) || i === correctIndex) options[i] = candidate;
    }
  }

  const questionText = expandAcronyms(cleanText(question.questionText)
    .replace(/\s*,\s*,/g, ",")
    .replace(/,\s*(?=\?|$)/g, "")
    .replace(/\s+/g, " "));

  return {
    ...question,
    questionText: questionText.charAt(0).toUpperCase() + questionText.slice(1),
    options,
    option_a: options[0],
    option_b: options[1],
    option_c: options[2],
    option_d: options[3],
  };
}

const finalQuestions = questions.slice(0, 200).map((question, index) => sanitizeFinalQuestion({
  ...question,
  id: `aws_ai_practitioner_${String(index + 1).padStart(3, "0")}`,
  uid: `aws_ai_practitioner_${String(index + 1).padStart(3, "0")}`,
}));

const bad = finalQuestions.filter((q) => !q.questionText || q.options.length !== 4 || q.options.some((o) => !o) || !/^[A-D]$/.test(q.correctAnswer));
if (bad.length) {
  throw new Error(`Generated ${bad.length} invalid questions`);
}

fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(finalQuestions, null, 2)}\n`);
console.log(`Wrote ${finalQuestions.length} questions to ${OUTPUT_PATH}`);
console.log(`Unique source questions: ${uniqueSourceCount}; exact source review repeats added: ${finalQuestions.length - uniqueSourceCount}`);




