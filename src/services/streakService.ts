// src/services/streakService.ts
import { getDb } from './database';

export async function checkAndUpdateStreak() {
    const db = await getDb();
    
    const profileRows = await db.select<{ id: number, current_streak: number, last_study_date: number }[]>('SELECT * FROM user_profile LIMIT 1');
    const now = new Date();
    // Normalizing to midnight local time for day comparison
    now.setHours(0, 0, 0, 0);
    const todayTimestamp = now.getTime();

    if (profileRows.length === 0) {
        // First time
        await db.execute(
            'INSERT INTO user_profile (current_streak, last_study_date) VALUES (?, ?)',
            [1, todayTimestamp]
        );
        return 1;
    }

    const profile = profileRows[0];
    if (!profile.last_study_date) {
        await db.execute(
            'UPDATE user_profile SET current_streak = ?, last_study_date = ? WHERE id = ?',
            [1, todayTimestamp, profile.id]
        );
        return 1;
    }

    const lastStudyDate = new Date(profile.last_study_date);
    lastStudyDate.setHours(0, 0, 0, 0);
    const lastTimestamp = lastStudyDate.getTime();

    const msInDay = 24 * 60 * 60 * 1000;
    const daysDifference = Math.round((todayTimestamp - lastTimestamp) / msInDay);

    let newStreak = profile.current_streak;

    if (daysDifference === 1) {
        // Studied yesterday, increment streak
        newStreak++;
        await db.execute(
            'UPDATE user_profile SET current_streak = ?, last_study_date = ? WHERE id = ?',
            [newStreak, todayTimestamp, profile.id]
        );
    } else if (daysDifference > 1) {
        // Streak broken
        newStreak = 1;
        await db.execute(
            'UPDATE user_profile SET current_streak = ?, last_study_date = ? WHERE id = ?',
            [newStreak, todayTimestamp, profile.id]
        );
    } // If daysDifference === 0, already studied today, do nothing

    return newStreak;
}
