// src/services/achievementsService.ts
import { getDb } from './database';
import { Achievement } from '../types/models';

export const ACHIEVEMENT_CATALOG: Achievement[] = [
    { id: 'first_quiz', name: 'First Quiz Completed', description: 'Complete your first study session.', icon: 'trophy', rarity: 'common', is_unlocked: false, progress: 0, requirement_value: 1 },
    { id: 'accuracy_master', name: 'Accuracy Master', description: 'Complete a session with 100% accuracy (min 10 questions).', icon: 'zap', rarity: 'rare', is_unlocked: false, progress: 0, requirement_value: 100 },
    { id: 'streak_3', name: '3-Day Streak', description: 'Study for 3 consecutive days.', icon: 'flame', rarity: 'common', is_unlocked: false, progress: 0, requirement_value: 3 },
    { id: 'streak_7', name: '7-Day Streak', description: 'Study for 1 week straight.', icon: 'flame', rarity: 'rare', is_unlocked: false, progress: 0, requirement_value: 7 },
    { id: 'domain_1_master', name: 'ML Fundamentalist', description: 'Reach 80% mastery in ML Fundamentals.', icon: 'cpu', rarity: 'epic', is_unlocked: false, progress: 0, requirement_value: 80 },
    { id: 'domain_2_master', name: 'GenAI Architect', description: 'Reach 80% mastery in Generative AI.', icon: 'brain', rarity: 'epic', is_unlocked: false, progress: 0, requirement_value: 80 },
    { id: 'question_100', name: 'Centurion', description: 'Answer 100 total questions.', icon: 'medal', rarity: 'rare', is_unlocked: false, progress: 0, requirement_value: 100 }
];

export async function checkAchievements() {
    const db = await getDb();
    
    // Total sessions
    const sessions = await db.select<{ count: number }[]>('SELECT COUNT(*) as count FROM study_sessions');
    const totalSessions = sessions[0].count;
    
    // Total questions
    const questions = await db.select<{ total: number }[]>('SELECT SUM(total_questions) as total FROM study_sessions');
    const totalQuestions = questions[0].total || 0;

    // Highest Streak
    const profile = await db.select<{ current_streak: number }[]>('SELECT current_streak FROM user_profile LIMIT 1');
    const streak = profile[0]?.current_streak || 0;

    for (const ach of ACHIEVEMENT_CATALOG) {
        let unlock = false;
        let currentProgress = 0;

        switch (ach.id) {
            case 'first_quiz':
                unlock = totalSessions >= 1;
                currentProgress = totalSessions >= 1 ? 100 : 0;
                break;
            case 'question_100':
                unlock = totalQuestions >= 100;
                currentProgress = Math.min(100, (totalQuestions / 100) * 100);
                break;
            case 'streak_3':
                unlock = streak >= 3;
                currentProgress = Math.min(100, (streak / 3) * 100);
                break;
            case 'streak_7':
                unlock = streak >= 7;
                currentProgress = Math.min(100, (streak / 7) * 100);
                break;
            // Add other cases here
        }

        if (unlock) {
            await db.execute(
                `INSERT OR IGNORE INTO achievements (
                    id, name, description, icon, rarity, is_unlocked, unlock_timestamp, progress, requirement_value
                ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)`,
                [ach.id, ach.name, ach.description, ach.icon, ach.rarity, Date.now(), 100, ach.requirement_value]
            );
        } else if (currentProgress > 0) {
            // Update progress only
             await db.execute(
                `INSERT OR REPLACE INTO achievements (
                    id, name, description, icon, rarity, is_unlocked, progress, requirement_value
                ) VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
                [ach.id, ach.name, ach.description, ach.icon, ach.rarity, Math.round(currentProgress), ach.requirement_value]
            );
        }
    }
}

export async function getUnlockedAchievements() {
    const db = await getDb();
    return db.select<Achievement[]>('SELECT * FROM achievements WHERE is_unlocked = 1');
}

export async function getAllAchievements() {
    const db = await getDb();
    const dbAchs = await db.select<Achievement[]>('SELECT * FROM achievements');
    const catalogWithProgress = ACHIEVEMENT_CATALOG.map(a => {
        const dbA = dbAchs.find(da => da.id === a.id);
        return dbA ? { ...a, ...dbA } : a;
    });
    return catalogWithProgress;
}
