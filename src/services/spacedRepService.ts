// src/services/spacedRepService.ts
import { getDb } from './database';
import { DOMAINS } from './examBlueprint';
import { Question, UserProgress } from '../types/models';

export interface StudyQueueItem {
    question: Question;
    priority: number;
}

export type StudyQueueType = "mixed" | "domain" | "weakness" | "fill_in_blank";

export async function getQuestionPool(
    type: StudyQueueType,
    domainId?: number,
    trackTag?: string
): Promise<{ questions: Question[]; progressMap: Map<string, UserProgress> }> {
    const db = await getDb();
    let questions: Question[] = [];

    if (type === "domain" && domainId) {
        questions = await db.select<Question[]>(
            'SELECT * FROM questions WHERE domain_id = ?',
            [domainId]
        );
    } else if (type === "fill_in_blank") {
        questions = await db.select<Question[]>(
            "SELECT * FROM questions WHERE question_type = 'fill_in_blank'"
        );
        if (questions.length === 0) {
            questions = await db.select<Question[]>(
                "SELECT * FROM questions WHERE uid LIKE 'google_fib_%'"
            );
        }
    } else {
        questions = await db.select<Question[]>('SELECT * FROM questions');
    }

    if (trackTag && trackTag.trim().length > 0) {
        const needle = trackTag.toLowerCase();

        if (needle === 'google-ai-professional-cert') {
            questions = questions.filter((q) => q.domain_id >= 6 && q.domain_id <= 12);
        } else {
            questions = questions.filter((q) => {
                const tagsRaw = Array.isArray(q.tags)
                    ? q.tags
                    : (() => {
                        try {
                            return JSON.parse((q as any).tags || '[]');
                        } catch {
                            return [];
                        }
                    })();
                return Array.isArray(tagsRaw) && tagsRaw.some((t: unknown) => String(t).toLowerCase() === needle);
            });
        }
    }

    const progressList = await db.select<UserProgress[]>(
        'SELECT * FROM user_progress'
    );
    const progressMap = new Map(progressList.map(p => [p.question_uid, p]));

    return { questions, progressMap };
}

export async function buildStudyQueue(
    count: number,
    type: "mixed" | "domain" | "weakness" | "fill_in_blank",
    domainId?: number,
    trackTag?: string
): Promise<Question[]> {
    const { questions, progressMap } = await getQuestionPool(type, domainId, trackTag);
    const progressList = Array.from(progressMap.values());

    // Better recency filter: Exclude the most recently answered questions to force rotation.
    // If we have 200 questions, excluding the last 50-60 ensures you don't see them again too soon.
    const sortedRecent = progressList
        .filter(p => p.last_attempt_timestamp)
        .sort((a, b) => (b.last_attempt_timestamp || 0) - (a.last_attempt_timestamp || 0));
    
    // Dynamically calculate exclusion count: 25% of the pool or at least 50 if possible.
    const excludeCount = Math.min(sortedRecent.length, Math.max(20, Math.floor(questions.length * 0.3)));
    const recentlySeenIds = new Set(sortedRecent.slice(0, excludeCount).map(p => p.question_uid));

    // Use the filtered pool; fallback if it's too small (e.g. very specialized sessions)
    const eligiblePool = questions.filter(q => !recentlySeenIds.has(q.uid));
    const sourcePool = eligiblePool.length >= count ? eligiblePool : questions;

    // Scoring logic
    const scoredQuestions = sourcePool.map(q => {
        const progress = progressMap.get(q.uid);
        let score = 0;

        if (progress) {
            // Priority for low mastery score
            score += (1.0 - progress.mastery_score) * 100;
            // Priority for never attempted
            if (progress.attempts === 0) score += 60;
        } else {
            // If no progress entry exists, it's a high priority entry
            score += 150;
        }

        // Domain weight boost
        const domain = DOMAINS.find((d) => d.id === q.domain_id);
        if (domain) {
            score += domain.weight * 40;
        }

        // Significantly increased random jitter to ensure variety
        score += Math.random() * 120;

        return { question: q, finalScore: score };
    });

    // Sort by score descending
    scoredQuestions.sort((a, b) => b.finalScore - a.finalScore);

    // Instead of just taking the top N, we take the top N*2 and shuffle them 
    // to break deterministic ordering for questions with similar scores.
    const candidateSize = Math.min(scoredQuestions.length, count * 2);
    const candidates = scoredQuestions.slice(0, candidateSize);
    
    // Fisher-Yates shuffle the candidates
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    return candidates.slice(0, count).map(sq => sq.question);
}

export async function updateMastery(questionUid: string, isCorrect: boolean) {
    const db = await getDb();
    const progress = await db.select<UserProgress[]>(
        'SELECT * FROM user_progress WHERE question_uid = ?',
        [questionUid]
    );

    const now = Date.now();
    const current = progress[0] || {
        question_uid: questionUid,
        attempts: 0,
        correct_attempts: 0,
        mastery_score: 0.0,
        difficulty_rating: 0
    } as UserProgress;

    const newAttempts = current.attempts + 1;
    const newCorrect = isCorrect ? current.correct_attempts + 1 : current.correct_attempts;

    // Mastery score is straightforward: accuracy ratio + recent performance weight
    // Recent correct answer adds small boost; recent incorrect adds small penalty
    const accuracy = newCorrect / newAttempts;
    const recencyWeight = 0.1;
    const recencyBonus = isCorrect ? recencyWeight : -recencyWeight;
    let newMastery = accuracy + recencyBonus;
    newMastery = Math.max(0.0, Math.min(1.0, newMastery)); // Clamp to [0, 1]

    await db.execute(
        `INSERT OR REPLACE INTO user_progress (
            question_uid, attempts, correct_attempts, last_attempt_timestamp, mastery_score, difficulty_rating
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [questionUid, newAttempts, newCorrect, now, newMastery, current.difficulty_rating]
    );
}
