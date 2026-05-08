// src/services/searchService.ts
import { getDb } from './database';
import { Question, SearchHistory } from '../types/models';
import { DOMAINS } from './examBlueprint';

const INTENT_CATEGORY_MAP: Record<string, string[]> = {
    // Common user intents -> active category taxonomy used in question banks
    "machine learning": ["fundamentals", "ai-terminology", "genai-llm-basics"],
    "ml": ["fundamentals", "ai-terminology", "genai-llm-basics"],
    "deep learning": ["generative-models", "genai-llm-basics"],
    "neural networks": ["generative-models", "genai-llm-basics"],
    "computer vision": ["ai-image-gen", "creativity", "generative-models"],
    "vision": ["ai-image-gen", "creativity", "generative-models"],
    "nlp": ["ai-terminology", "genai-llm-basics", "prompt-basics", "prompt-advanced"],
    "language": ["ai-terminology", "genai-llm-basics", "prompt-basics", "prompt-advanced"],
    "llm": ["genai-llm-basics", "ai-terminology", "prompt-advanced"],
    "llms": ["genai-llm-basics", "ai-terminology", "prompt-advanced"],
    "prompt": ["prompt-basics", "prompt-advanced", "upskilling"],
    "prompt engineering": ["prompt-basics", "prompt-advanced", "upskilling"],
    "ethics": ["responsible-ai", "bias-fairness"],
    "responsible ai": ["responsible-ai", "bias-fairness"],
    "bias": ["bias-fairness", "responsible-ai"],
    "fairness": ["bias-fairness", "responsible-ai"],
    "automation": ["automation", "workflow-audit", "time-management"],
    "agent": ["automation", "workflow-audit"],
    "agents": ["automation", "workflow-audit"],
    "research": ["deep-research", "notebooklm-summary", "ai-applications"],
    "notebooklm": ["notebooklm-hubs", "notebooklm-summary", "deep-research"],
    "gemini": ["gemini-gems", "gemini-meet", "gemini-live", "gemini-canvas-write", "gemini-sheets"],
    "google workspace": ["google-tools", "gemini-meet", "gemini-sheets"],
    "video": ["ai-media-gen", "creativity"],
    "vibe coding": ["vibe-coding-basics", "ai-studio", "workflow-audit"],
};

function normalizeText(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ");
}

function expandCategoryIntents(query: string, terms: string[]): string[] {
    const normalizedQuery = normalizeText(query);
    const set = new Set<string>();

    // Phrase-level matches (e.g. "machine learning", "neural networks")
    for (const [intent, categories] of Object.entries(INTENT_CATEGORY_MAP)) {
        if (normalizedQuery.includes(intent)) {
            categories.forEach((c) => set.add(c.toLowerCase()));
        }
    }

    // Token-level matches (e.g. "ethics", "vision")
    for (const term of terms) {
        const categories = INTENT_CATEGORY_MAP[term];
        if (categories) categories.forEach((c) => set.add(c.toLowerCase()));
    }

    // Keep only categories that actually exist in the active blueprint.
    const categoryUniverse = new Set(
        DOMAINS.flatMap((domain) => domain.categories).map((category) => normalizeText(category))
    );

    return Array.from(set).filter((category) => categoryUniverse.has(normalizeText(category)));
}

export async function searchQuestions(query: string): Promise<Question[]> {
    const db = await getDb();
    const normalized = normalizeText(query);
    if (!normalized) return [];

    // Split into terms for loose matching.
    const terms = normalized.split(/\s+/).filter(Boolean).slice(0, 8);
    if (terms.length === 0) return [];
    const categoryExpansions = expandCategoryIntents(normalized, terms);

    const fieldExpression = `
      LOWER(COALESCE(question_text, '')) || ' ' ||
      LOWER(COALESCE(explanation, '')) || ' ' ||
      LOWER(COALESCE(tags, '')) || ' ' ||
      LOWER(COALESCE(category, '')) || ' ' ||
      LOWER(COALESCE(option_a, '')) || ' ' ||
      LOWER(COALESCE(option_b, '')) || ' ' ||
      LOWER(COALESCE(option_c, '')) || ' ' ||
      LOWER(COALESCE(option_d, '')) || ' ' ||
      LOWER(COALESCE(option_e, '')) || ' ' ||
      LOWER(COALESCE(option_f, '')) || ' ' ||
      LOWER(COALESCE(option_g, '')) || ' ' ||
      LOWER(COALESCE(option_h, '')) || ' ' ||
      LOWER(COALESCE(option_i, '')) || ' ' ||
      LOWER(COALESCE(scenario, '')) || ' ' ||
      LOWER(COALESCE(remediation_notes, ''))
    `;

    const anyTermClause = terms.map(() => `${fieldExpression} LIKE ?`).join(" OR ");
    const anyTermParams = terms.map((t) => `%${t}%`);

    const categoryClause = categoryExpansions.length > 0
        ? ` OR LOWER(REPLACE(REPLACE(COALESCE(category, ''), '-', ' '), '_', ' ')) IN (${categoryExpansions.map(() => '?').join(",")})`
        : "";
    const categoryParams = categoryExpansions;

    const scoreByTerm = terms.map(() => `CASE WHEN ${fieldExpression} LIKE ? THEN 8 ELSE 0 END`).join(" + ");
    const scoreByCategory = categoryExpansions.length > 0
        ? " + " + categoryExpansions.map(() => `CASE WHEN LOWER(REPLACE(REPLACE(COALESCE(category, ''), '-', ' '), '_', ' ')) = ? THEN 28 ELSE 0 END`).join(" + ")
        : "";

    return db.select<Question[]>(
        `SELECT * FROM questions
         WHERE (${anyTermClause}${categoryClause})
         ORDER BY
            (
                CASE WHEN LOWER(COALESCE(question_text, '')) LIKE ? THEN 120 ELSE 0 END +
                CASE WHEN LOWER(COALESCE(tags, '')) LIKE ? THEN 40 ELSE 0 END +
                CASE WHEN LOWER(COALESCE(category, '')) LIKE ? THEN 35 ELSE 0 END +
                ${scoreByTerm}
                ${scoreByCategory}
            ) DESC,
            LENGTH(COALESCE(question_text, '')) ASC
         LIMIT 250`,
        [
            ...anyTermParams,
            ...categoryParams,
            `%${normalized}%`,
            `%${normalized}%`,
            `%${normalized}%`,
            ...terms.map((t) => `%${t}%`),
            ...categoryParams
        ]
    );
}

export async function getSearchHistory(): Promise<SearchHistory[]> {
    const db = await getDb();
    return db.select<SearchHistory[]>('SELECT * FROM search_history ORDER BY timestamp DESC LIMIT 10');
}

export async function getPopularSearchTerms(): Promise<string[]> {
    const db = await getDb();
    const rows = await db.select<{ category: string; count: number }[]>(
        `SELECT category, COUNT(*) as count
         FROM questions
         WHERE category IS NOT NULL AND TRIM(category) != ''
         GROUP BY category
         ORDER BY count DESC, category ASC
         LIMIT 5`
    );

    return rows.map((row) =>
        row.category
            .replace(/[-_]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b\w/g, (char) => char.toUpperCase())
    );
}

export async function addToHistory(query: string) {
    const db = await getDb();
    const cleaned = query.trim();
    if (!cleaned) return;

    // Avoid storing duplicate consecutive entries.
    const last = await db.select<SearchHistory[]>('SELECT query FROM search_history ORDER BY timestamp DESC LIMIT 1');
    if (last.length > 0 && last[0].query.toLowerCase() === cleaned.toLowerCase()) {
        return;
    }

    await db.execute(
        'INSERT INTO search_history (query, timestamp) VALUES (?, ?)',
        [cleaned, Date.now()]
    );
}

export async function clearHistory() {
    const db = await getDb();
    await db.execute('DELETE FROM search_history');
}
