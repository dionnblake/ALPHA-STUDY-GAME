// src/services/seedingService.ts
import { getDb } from './database';
import { getDomainForCategory } from './examBlueprint';

const FILES = [
    '/questions/google_ai_essentials_transcript_questions.json',
    '/questions/google_generative_ai_leader_questions.json',
    '/questions/fill_in_blank_questions.json',
    '/questions/google_ai_professional_cert.json',
    '/questions/prompt_engineering_full_course_questions.json',
    '/questions/genai_on_google_cloud_questions.json',
    '/questions/aws_certified_ai_practitioner_questions.json'
];

type RawQuestion = {
    uid?: string;
    id?: string;
    question_text?: string;
    questionText?: string;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    option_e?: string;
    option_f?: string;
    option_g?: string;
    option_h?: string;
    option_i?: string;
    options?: string[];
    correct_answer?: string;
    correctAnswer?: string;
    correctAnswers?: string[];
    explanation?: string;
    detailedExplanation?: string;
    category?: string;
    tags?: string[] | string;
    questionType?: string;
    question_type?: string;
    caseStudy?: string;
    scenario?: string;
    remediationNotes?: string;
    learningObjective?: string;
    difficulty?: string;
};

function extractQuestions(payload: unknown): RawQuestion[] {
    if (Array.isArray(payload)) {
        return payload as RawQuestion[];
    }
    if (payload && typeof payload === 'object' && Array.isArray((payload as { questions?: unknown }).questions)) {
        return (payload as { questions: RawQuestion[] }).questions;
    }
    return [];
}

function normalizeTags(tags: RawQuestion['tags']): string[] {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string' && tags.trim().length > 0) return [tags];
    return [];
}

function normalizeAnswerValue(value: string | undefined): string {
    // Trim, lowercase, and remove common trailing markers like '.' or ')'
    return (value ?? '').trim().toLowerCase().replace(/[.)]$/, '');
}

function toQuestionRow(q: RawQuestion, fallbackUid: string, difficulty: string) {
    const options = Array.isArray(q.options) ? q.options : [];
    const questionText = q.question_text ?? q.questionText ?? '';
    const questionType = q.question_type ?? q.questionType ?? 'multiple_choice';
    const category = q.category ?? 'GENERAL';
    const domain = getDomainForCategory(category);
    
    // Normalize correct_answer to a key (A, B, C, etc.) or a structured string
    let normalizedCorrectAnswer = '';
    const rawCorrect = q.correct_answer ?? q.correctAnswer ?? (q.correctAnswers?.join('|')) ?? '';

    if (questionType === 'multiple_choice' || questionType === 'fill_in_blank' || !questionType) {
        // Find which option matches the text
        const optionValues = [
            q.option_a ?? options[0], q.option_b ?? options[1], q.option_c ?? options[2], 
            q.option_d ?? options[3], q.option_e ?? options[4], q.option_f ?? options[5],
            q.option_g ?? options[6], q.option_h ?? options[7], q.option_i ?? options[8]
        ];

        const normalizedRaw = normalizeAnswerValue(rawCorrect);
        const matchIndex = optionValues.findIndex(
            (v) => normalizeAnswerValue(v) === normalizedRaw
        );
        if (matchIndex !== -1) {
            normalizedCorrectAnswer = String.fromCharCode(65 + matchIndex); // 0 -> A, 1 -> B, etc.
        } else {
            // Check if it's a letter like "A", "A.", "B)"
            const letterMatch = rawCorrect.trim().match(/^([A-I])(?:\.|\)|$|\s)/i);
            if (letterMatch) {
                normalizedCorrectAnswer = letterMatch[1].toUpperCase();
            } else {
                normalizedCorrectAnswer = rawCorrect.trim();
            }
        }
    } else if (questionType === 'multiple_response') {
        const correctTexts = q.correctAnswers ?? (typeof rawCorrect === 'string' ? rawCorrect.split('|') : []);
        const optionValues = [
            q.option_a ?? options[0], q.option_b ?? options[1], q.option_c ?? options[2], 
            q.option_d ?? options[3], q.option_e ?? options[4], q.option_f ?? options[5],
            q.option_g ?? options[6], q.option_h ?? options[7], q.option_i ?? options[8]
        ];
        
        const matchingLetters = [];
        for (const text of correctTexts) {
            const normalizedText = normalizeAnswerValue(text);
            const idx = optionValues.findIndex(
                (v) => normalizeAnswerValue(v) === normalizedText
            );
            if (idx !== -1) matchingLetters.push(String.fromCharCode(65 + idx));
        }
        normalizedCorrectAnswer = matchingLetters.sort().join(',');
    } else if (questionType === 'ordering') {
        // For ordering, we store the correct sequence of identifiers (A,B,C...)
        const orderedTexts = q.correctAnswers ?? (typeof rawCorrect === 'string' ? rawCorrect.split('|') : []);
        const optionValues = [
            q.option_a ?? options[0], q.option_b ?? options[1], q.option_c ?? options[2], 
            q.option_d ?? options[3], q.option_e ?? options[4], q.option_f ?? options[5],
            q.option_g ?? options[6], q.option_h ?? options[7], q.option_i ?? options[8]
        ];

        const sequence = [];
        for (const text of orderedTexts) {
            const normalizedText = normalizeAnswerValue(text);
            const idx = optionValues.findIndex(
                (v) => normalizeAnswerValue(v) === normalizedText
            );
            if (idx !== -1) sequence.push(String.fromCharCode(65 + idx));
        }
        normalizedCorrectAnswer = sequence.join(',');
    } else {
        normalizedCorrectAnswer = rawCorrect;
    }

    return {
        uid: q.uid ?? q.id ?? fallbackUid,
        question_text: questionText,
        option_a: q.option_a ?? options[0] ?? '',
        option_b: q.option_b ?? options[1] ?? '',
        option_c: q.option_c ?? options[2] ?? '',
        option_d: q.option_d ?? options[3] ?? '',
        option_e: q.option_e ?? options[4] ?? null,
        option_f: q.option_f ?? options[5] ?? null,
        option_g: q.option_g ?? options[6] ?? null,
        option_h: q.option_h ?? options[7] ?? null,
        option_i: q.option_i ?? options[8] ?? null,
        correct_answer: normalizedCorrectAnswer,
        // Use detailedExplanation over explanation when available — it is richer.
        // For adaptive questions, remediationNotes is the most actionable content.
        explanation: q.detailedExplanation ?? q.explanation ?? '',
        remediation_notes: q.remediationNotes ?? null,
        category,
        difficulty: q.difficulty ?? difficulty,
        tags: JSON.stringify(normalizeTags(q.tags)),
        domain_id: domain ? domain.id : 0,
        question_type: questionType,
        scenario: (q.scenario?.trim() || q.caseStudy?.trim()) || null
    };
}

export async function seedAchievements() {
    const db = await getDb();
    const achievements = [
        { id: 'first_mission', name: 'Neural Link Established', description: 'Complete your first study mission.', icon: 'Zap', rarity: 'Common', req: 1 },
        { id: 'perfect_score', name: 'Synaptic Override', description: 'Achieve 100% accuracy in a single mission.', icon: 'Check', rarity: 'Rare', req: 1 },
        { id: 'xp_1000', name: 'Cognitive Ascendant', description: 'Earn a total of 1,000 Neural XP.', icon: 'TrendingUp', rarity: 'Rare', req: 1000 },
        { id: 'streak_3', name: 'Temporal Momentum', description: 'Maintain a study streak for 3 consecutive days.', icon: 'Flame', rarity: 'Epic', req: 3 },
        { id: 'domain_master', name: 'Sector Specialist', description: 'Reach 100% mastery in any single domain.', icon: 'Award', rarity: 'Legendary', req: 100 }
    ];

    for (const ach of achievements) {
        await db.execute(
            `INSERT OR IGNORE INTO achievements (id, name, description, icon, rarity, requirement_value)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [ach.id, ach.name, ach.description, ach.icon, ach.rarity, ach.req]
        );
    }
}

export async function ensureProfile() {
    const db = await getDb();
    await db.execute(
        `INSERT OR IGNORE INTO user_profile (id, username, total_points, current_streak)
         VALUES (1, 'AI Trainee', 0, 0)`
    );
}

export async function seedDatabase(onProgress: (percent: number) => void) {
    await ensureProfile();
    await seedAchievements();
    const db = await getDb();
    let totalQuestions = 0;
    let processedQuestions = 0;
    const filesWithQuestions: Array<{ file: string; questions: RawQuestion[] }> = [];

    // Load all files once and count total safely.
    for (const file of FILES) {
        const response = await fetch(file);
        const payload = await response.json();
        const questions = extractQuestions(payload);
        filesWithQuestions.push({ file, questions });
        totalQuestions += questions.length;
    }

    if (totalQuestions === 0) {
        onProgress(100);
        return;
    }

    // Insert normalized rows.
    for (const { questions } of filesWithQuestions) {
        const difficulty = 'adaptive';

        for (let index = 0; index < questions.length; index++) {
            const q = questions[index];
            const row = toQuestionRow(q, `seed_${index}`, difficulty);

                await db.execute(
                    `INSERT OR REPLACE INTO questions (
                        uid, question_text, option_a, option_b, option_c, option_d,
                        option_e, option_f, option_g, option_h, option_i,
                        correct_answer, explanation, remediation_notes,
                        category, difficulty, tags, domain_id, question_type, scenario
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        row.uid,
                        row.question_text,
                        row.option_a,
                        row.option_b,
                        row.option_c,
                        row.option_d,
                        row.option_e,
                        row.option_f,
                        row.option_g,
                        row.option_h,
                        row.option_i,
                        row.correct_answer,
                        row.explanation,
                        row.remediation_notes,
                        row.category,
                        row.difficulty,
                        row.tags,
                        row.domain_id,
                        row.question_type,
                        row.scenario
                    ]
                );

            processedQuestions++;
            onProgress(Math.round((processedQuestions / totalQuestions) * 100));
        }
    }
}
