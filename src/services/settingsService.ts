// src/services/settingsService.ts
import { getDb } from './database';
import { Settings } from '../types/models';

export const DEFAULT_SETTINGS: Settings = {
    theme: 'dark',
    quiz_timer_enabled: true,
    quiz_timer_seconds: 60,
    verbosity_level: 'detailed',
    daily_goal_questions: 20,
    sound_enabled: false // as discussed, using visual feedback
};

export async function getSettings(): Promise<Settings> {
    const db = await getDb();
    const rows = await db.select<{ key: string, value: string }[]>('SELECT * FROM settings');
    
    if (rows.length === 0) {
        return DEFAULT_SETTINGS;
    }

    const settings: any = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
        try {
            settings[row.key] = JSON.parse(row.value);
        } catch {
            settings[row.key] = row.value;
        }
    }

    return settings as Settings;
}

export async function saveSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    const db = await getDb();
    const strValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    await db.execute(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, strValue]
    );
}

export async function updateSettings(settings: Settings) {
    const db = await getDb();
    for (const [key, value] of Object.entries(settings)) {
        const strValue = typeof value === 'string' ? value : JSON.stringify(value);
        await db.execute(
            'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
            [key, strValue]
        );
    }
}
