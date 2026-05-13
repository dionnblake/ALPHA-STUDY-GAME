// src/services/analyticsService.ts
import { getDb } from './database';
import { DOMAINS } from './examBlueprint';

export const TRACK_DEFINITIONS = [
    { tag: 'google-ai-essentials', label: 'AI Essentials' },
    { tag: 'google-ai-professional-cert', label: 'AI Professional' },
    { tag: 'prompt-engineering-full-course', label: 'Prompt Engineering' },
    { tag: 'google-generative-ai-leader', label: 'GenAI Leader' },
    { tag: 'genai-on-google-cloud', label: 'GenAI on Google Cloud' },
    { tag: 'aws-certified-ai-practitioner', label: 'AWS Certified AI Practitioner' }
] as const;

export interface DashboardStats {
    accuracy: number;
    totalXP: number;
    level: number;
    avgSpeed: number; // Avg seconds per question
    streakCount: string;
    streakHistory: number[];
    sessionHistory: number[]; // Accuracy % per session (last 15)
    sessionTrend: SessionTrendPoint[];
    domainProgress: Record<number, number>;
    domainXP: Record<number, number>;
    trackProgress: Record<string, number>;
    completedMissions: number;
    hoursStudied: number;
    overallMastery: number;
    missionsThisWeek: number;
    xpThisWeek: number;
    accuracyChange: number;
    hoursThisWeek: number;
    radarData: {
        ai_systems: number;
        deep_learning: number;
        data_patterns: number;
        nlp: number;
    };
    rankTitle: string;
}

export interface SessionTrendPoint {
    id: number;
    startTimestamp: number;
    sessionType: string;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
}

export function getRankTitle(level: number): string {
    if (level >= 50) return "Singularity Architect";
    if (level >= 40) return "Transcendental Logic";
    if (level >= 30) return "Ghost in the Machine";
    if (level >= 25) return "Neural Overseer";
    if (level >= 20) return "Master Optimizer";
    if (level >= 15) return "Algorithm Sage";
    if (level >= 10) return "Systems specialist";
    if (level >= 7) return "Logic Architect";
    if (level >= 5) return "Data Guardian";
    if (level >= 3) return "Neural Initiate";
    return "AI Trainee";
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const db = await getDb();

    // 1. Calculate Global Accuracy
    const sessions = await db.select<{ total: number, correct: number }[]>(
        'SELECT SUM(total_questions) as total, SUM(correct_answers) as correct FROM study_sessions'
    );

    let accuracy = 0;
    if (sessions.length > 0 && sessions[0].total > 0) {
        accuracy = Math.round((sessions[0].correct / sessions[0].total) * 100);
    }

    // 2. Domain Specific Stats (Progress & XP)
    const domainStats = await db.select<{ domain_id: number, correct: number, total: number }[]>(
        `SELECT q.domain_id, 
                SUM(up.correct_attempts) as correct, 
                SUM(up.attempts) as total
         FROM user_progress up
         JOIN questions q ON up.question_uid = q.uid
         GROUP BY q.domain_id`
    );

    const domainProgress: Record<number, number> = {};
    const domainXP: Record<number, number> = {};
    for (const domain of DOMAINS) {
        domainProgress[domain.id] = 0;
        domainXP[domain.id] = 0;
    }
    domainStats.forEach(ds => {
        domainProgress[ds.domain_id] = ds.total > 0 ? Math.round((ds.correct / ds.total) * 100) : 0;
        domainXP[ds.domain_id] = ds.total * 10; // 10 XP per attempt
    });

    // Track-level progress from question tags so section analytics maps to actual study tracks.
    const trackProgress: Record<string, number> = {};
    const trackAggregate: Record<string, { correct: number; attempts: number }> = {};
    for (const track of TRACK_DEFINITIONS) {
        trackProgress[track.tag] = 0;
        trackAggregate[track.tag] = { correct: 0, attempts: 0 };
    }

    const tagRows = await db.select<{ tags: string; correct_attempts: number; attempts: number }[]>(
        `SELECT q.tags as tags, up.correct_attempts as correct_attempts, up.attempts as attempts
         FROM user_progress up
         JOIN questions q ON up.question_uid = q.uid`
    );

    for (const row of tagRows) {
        let tags: string[] = [];
        try {
            const parsed = JSON.parse(row.tags || '[]');
            if (Array.isArray(parsed)) {
                tags = parsed.map((t) => String(t).toLowerCase());
            }
        } catch {
            tags = [];
        }

        for (const track of TRACK_DEFINITIONS) {
            if (!tags.includes(track.tag)) continue;
            trackAggregate[track.tag].correct += row.correct_attempts || 0;
            trackAggregate[track.tag].attempts += row.attempts || 0;
        }
    }

    for (const track of TRACK_DEFINITIONS) {
        const aggregate = trackAggregate[track.tag];
        trackProgress[track.tag] = aggregate.attempts > 0
            ? Math.round((aggregate.correct / aggregate.attempts) * 100)
            : 0;
    }

    // 3. Radar Data (Skill Breakdown)
    // Map categories to 4 axes
    const radar = {
        ai_systems: domainProgress[1] || 0,
        deep_learning: domainProgress[2] || 0,
        data_patterns: domainProgress[3] || 0,
        nlp: Math.round(((domainProgress[4] || 0) + (domainProgress[5] || 0)) / 2),
    };

    // 4. Get User Profile
    const profile = await db.select<{ total_points: number, current_streak: number }[]>(
        'SELECT total_points, current_streak FROM user_profile LIMIT 1'
    );

    const xp = profile.length > 0 ? profile[0].total_points : 0;
    const currentStreak = profile.length > 0 ? profile[0].current_streak : 0;
    const level = Math.floor(xp / 1000) + 1;

    // 5. Recent Session History (for the trendline)
    const recentSessions = await db.select<{
        id: number;
        start_timestamp: number;
        session_type: string;
        correct: number;
        total: number;
    }[]>(
        `SELECT
            id,
            start_timestamp,
            session_type,
            correct_answers as correct,
            total_questions as total
         FROM study_sessions
         ORDER BY start_timestamp DESC
         LIMIT 15`
    );
    // Reverse to chronological for the graph
    const sessionTrend = recentSessions.reverse().map(rs => ({
        id: rs.id,
        startTimestamp: rs.start_timestamp,
        sessionType: rs.session_type,
        totalQuestions: rs.total || 0,
        correctAnswers: rs.correct || 0,
        accuracy: rs.total > 0 ? Math.round((rs.correct / rs.total) * 100) : 0
    }));
    const sessionHistory = sessionTrend.map((session) => session.accuracy);

    // 6. Streak History (Last 7 days)
    const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const historyRows = await db.select<{ day: string, count: number }[]>(
        `SELECT STRFTIME('%Y-%m-%d', datetime(start_timestamp / 1000, 'unixepoch')) as day,
                SUM(total_questions) as count
         FROM study_sessions
         WHERE start_timestamp > ?
         GROUP BY day
         ORDER BY day DESC
         LIMIT 7`,
        [sevenDaysAgoMs]
    );

    const history: number[] = new Array(7).fill(0);
    const peakDailyQuestions = Math.max(1, ...historyRows.map(r => r.count || 0));
    const now = new Date();
    for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        const row = historyRows.find(r => r.day === dayStr);
        if (row) {
            history[6 - i] = Math.min(100, Math.round(((row.count || 0) / peakDailyQuestions) * 100));
        }
    }

    const totalSessions = await db.select<{ dur: number, q: number }[]>(
        'SELECT duration_seconds as dur, total_questions as q FROM study_sessions'
    );
    const avgSpeed = (totalSessions.length > 0 && totalSessions.reduce((acc, s) => acc + (s.q > 0 ? s.q : 0), 0) > 0)
        ? Math.round(totalSessions.reduce((acc, s) => acc + (s.dur || 0), 0) / totalSessions.reduce((acc, s) => acc + (s.q || 0), 0))
        : 0;

    // Calculate completed missions (number of study sessions)
    const completedMissions = totalSessions.length;

    // Calculate hours studied (sum of duration_seconds / 3600)
    const totalSeconds = totalSessions.reduce((acc, s) => acc + (s.dur || 0), 0);
    const hoursStudied = Math.round((totalSeconds / 3600) * 10) / 10; // Round to 1 decimal

    // Calculate overall mastery (average of domain progress)
    const domainProgressValues = DOMAINS.map(d => domainProgress[d.id] || 0);
    const overallMastery = domainProgressValues.length > 0
        ? Math.round(domainProgressValues.reduce((a, b) => a + b, 0) / domainProgressValues.length)
        : 0;

    // Calculate this week stats
    const thisWeekSessions = await db.select<{ count: number, seconds: number, correct: number, total: number }[]>(
        `SELECT
            COUNT(*) as count,
            SUM(duration_seconds) as seconds,
            SUM(correct_answers) as correct,
            SUM(total_questions) as total
         FROM study_sessions
         WHERE start_timestamp > ?`,
        [sevenDaysAgoMs]
    );

    const missionsThisWeek = thisWeekSessions[0]?.count || 0;
    const hoursThisWeek = thisWeekSessions[0]?.seconds ? Math.round((thisWeekSessions[0].seconds / 3600) * 10) / 10 : 0;
    const thisWeekTotal = thisWeekSessions[0]?.total || 0;
    const thisWeekCorrect = thisWeekSessions[0]?.correct || 0;
    const thisWeekAccuracy = thisWeekTotal > 0 ? Math.round((thisWeekCorrect / thisWeekTotal) * 100) : 0;

    // Compare this week vs previous week for a meaningful delta.
    const twoWeeksAgoMs = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const previousWeekSessions = await db.select<{ correct: number, total: number }[]>(
        `SELECT
            SUM(correct_answers) as correct,
            SUM(total_questions) as total
         FROM study_sessions
         WHERE start_timestamp > ? AND start_timestamp <= ?`,
        [twoWeeksAgoMs, sevenDaysAgoMs]
    );
    const prevWeekTotal = previousWeekSessions[0]?.total || 0;
    const prevWeekCorrect = previousWeekSessions[0]?.correct || 0;
    const prevWeekAccuracy = prevWeekTotal > 0 ? Math.round((prevWeekCorrect / prevWeekTotal) * 100) : 0;
    const accuracyChange = thisWeekAccuracy - prevWeekAccuracy;

    // Calculate XP this week - Reward XP based on actual correct answers this week
    const xpThisWeek = (missionsThisWeek * 100) + (thisWeekCorrect * 10);

    const finalStats = {
        accuracy,
        totalXP: xp,
        level,
        avgSpeed,
        streakCount: `${currentStreak}d`,
        streakHistory: history,
        domainProgress,
        domainXP,
        trackProgress,
        completedMissions,
        hoursStudied,
        overallMastery,
        missionsThisWeek,
        xpThisWeek,
        accuracyChange,
        hoursThisWeek,
        radarData: radar,
        sessionHistory, // Accuracy % per session
        sessionTrend,
        rankTitle: getRankTitle(level)
    };

    console.log("Analytics generated:", finalStats);
    return finalStats;
}
