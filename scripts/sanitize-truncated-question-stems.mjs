import fs from "node:fs";
import path from "node:path";

const QUESTIONS_DIR = "public/questions";

function categoryLabel(category) {
  return String(category || "general ai knowledge")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isTruncatedStem(text) {
  const value = String(text || "");
  if (!value.trim()) return false;
  return /â€¦|…|\.{3,}/.test(value);
}

function safeStem(question, index) {
  const label = categoryLabel(question.category);
  return `Item ${index}: Which option best fits this ${label} review concept?`;
}

function loadItems(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return { wrapper: null, items: parsed };
  if (parsed && Array.isArray(parsed.questions)) return { wrapper: parsed, items: parsed.questions };
  return { wrapper: null, items: [] };
}

function saveItems(filePath, wrapper, items) {
  const output = wrapper ? { ...wrapper, questions: items } : items;
  fs.writeFileSync(filePath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
}

const files = fs
  .readdirSync(QUESTIONS_DIR)
  .filter((name) => name.endsWith(".json"))
  .map((name) => path.join(QUESTIONS_DIR, name));

for (const filePath of files) {
  const { wrapper, items } = loadItems(filePath);
  let patched = 0;

  const next = items.map((question, i) => {
    const qText = question.questionText ?? question.question_text ?? "";
    if (!isTruncatedStem(qText)) return question;
    patched += 1;
    const stem = safeStem(question, i + 1);
    return { ...question, questionText: stem, question_text: stem };
  });

  if (patched > 0) {
    saveItems(filePath, wrapper, next);
  }

  console.log(`${filePath}: patched=${patched} total=${items.length}`);
}
