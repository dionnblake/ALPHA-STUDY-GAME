import { getDb } from './database';

export type GrowthEventName = 'share_clicked' | 'invite_accepted';

interface ChallengePayload {
    accuracy: number;
    pointsEarned: number;
    totalQuestions: number;
    correctAnswers: number;
}

function sanitizeStat(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) return min;
    return Math.min(Math.max(Math.round(value), min), max);
}

function toBase64Url(value: string): string {
    return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): string {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    return atob(padded);
}

export function createChallengeToken(payload: ChallengePayload): string {
    const safePayload: ChallengePayload = {
        accuracy: sanitizeStat(payload.accuracy, 0, 100),
        pointsEarned: sanitizeStat(payload.pointsEarned, 0, 99999),
        totalQuestions: sanitizeStat(payload.totalQuestions, 1, 999),
        correctAnswers: sanitizeStat(payload.correctAnswers, 0, 999)
    };

    return toBase64Url(JSON.stringify(safePayload));
}

export function parseChallengeToken(token: string | null): ChallengePayload | null {
    if (!token) return null;
    try {
        const raw = JSON.parse(fromBase64Url(token)) as Partial<ChallengePayload>;
        if (typeof raw !== 'object' || raw === null) return null;

        const totalQuestions = sanitizeStat(raw.totalQuestions ?? 0, 1, 999);
        const correctAnswers = sanitizeStat(raw.correctAnswers ?? 0, 0, totalQuestions);
        const accuracy = sanitizeStat(raw.accuracy ?? Math.round((correctAnswers / totalQuestions) * 100), 0, 100);
        const pointsEarned = sanitizeStat(raw.pointsEarned ?? correctAnswers * 15, 0, 99999);

        return { accuracy, pointsEarned, totalQuestions, correctAnswers };
    } catch {
        return null;
    }
}

export function buildChallengeMessage(payload: ChallengePayload, token: string): string {
    const hashRoute = `#/quiz?challenge=${encodeURIComponent(token)}`;
    const shareUrl = `${window.location.origin}${window.location.pathname}${hashRoute}`;
    return `I scored ${payload.accuracy}% (${payload.correctAnswers}/${payload.totalQuestions}) and earned ${payload.pointsEarned} XP in AI Study Game. Beat my run: ${shareUrl}`;
}

export async function logGrowthEvent(eventName: GrowthEventName, payload?: Record<string, unknown>): Promise<void> {
    const db = await getDb();
    await db.execute(
        'INSERT INTO event_logs (event_name, event_timestamp, payload) VALUES (?, ?, ?)',
        [eventName, Date.now(), payload ? JSON.stringify(payload) : null]
    );
}
