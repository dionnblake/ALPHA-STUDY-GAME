// src/services/sessionService.ts
import { getDb } from './database';
import { SessionMetadata, StudySession } from '../types/models';
import { buildTopicPerformance } from './adaptiveExamService';
import { checkAndUpdateStreak } from './streakService';

let currentSession: StudySession | null = null;

export async function startSession(
    type: StudySession['session_type'],
    metadata?: SessionMetadata
): Promise<StudySession> {
    const session: StudySession = {
        start_timestamp: Date.now(),
        total_questions: 0,
        correct_answers: 0,
        session_type: type,
        session_metadata: metadata ? JSON.stringify(metadata) : undefined
    };

    currentSession = session;
    return session;
}

export async function recordResponse(isCorrect: boolean) {
    if (!currentSession) return;
    currentSession.total_questions++;
    if (isCorrect) currentSession.correct_answers++;
}

export async function updateSessionMetadata(patch: Partial<SessionMetadata>) {
    if (!currentSession) return;

    const existing = currentSession.session_metadata
        ? JSON.parse(currentSession.session_metadata) as SessionMetadata
        : {};

    const merged = {
        ...existing,
        ...patch
    };

    if (merged.question_metrics) {
        merged.topic_performance = buildTopicPerformance(merged.question_metrics);
        merged.weak_areas = Object.entries(merged.topic_performance)
            .filter(([, value]) => value.classification === 'weak')
            .map(([key]) => key);
        merged.strong_areas = Object.entries(merged.topic_performance)
            .filter(([, value]) => value.classification === 'strong')
            .map(([key]) => key);
    }

    currentSession.session_metadata = JSON.stringify(merged);
}

export async function endSession(): Promise<number> {
    if (!currentSession) return 0;

    const db = await getDb();
    currentSession.end_timestamp = Date.now();
    const durationSeconds = Math.round((currentSession.end_timestamp - currentSession.start_timestamp) / 1000);

    const result = await db.execute(
        `INSERT INTO study_sessions (
            start_timestamp, end_timestamp, duration_seconds, total_questions, correct_answers, session_type, session_metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            currentSession.start_timestamp,
            currentSession.end_timestamp,
            durationSeconds,
            currentSession.total_questions,
            currentSession.correct_answers,
            currentSession.session_type,
            currentSession.session_metadata || null
        ]
    );

    // Reward XP: 100 XP per mission + 10 XP per correct answer
    const rewardedXp = 100 + (currentSession.correct_answers * 10);
    await db.execute('UPDATE user_profile SET total_points = total_points + ? WHERE id = 1', [rewardedXp]);

    // Update streak
    await checkAndUpdateStreak();

    const sessionId = result.lastInsertId ?? 0;
    currentSession = null;
    return sessionId;
}

export function getCurrentSession() {
    return currentSession;
}
