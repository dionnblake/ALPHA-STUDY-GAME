// src/services/database.ts
import Database from '@tauri-apps/plugin-sql';

let db: Database | null = null;

// Mock database for dev mode
class MockDatabase {
  async select<T>(sql: string): Promise<T> {
    console.log('[MockDB] select:', sql);
    // Return appropriate mock data based on query type
    if (sql.includes('COUNT(*)')) {
      return [{ count: 0 }] as any;
    }
    if (sql.includes('SELECT value FROM settings')) {
      return [] as any;
    }
    return [] as any;
  }
  async execute(sql: string, params?: any[]): Promise<void> {
    console.log('[MockDB] execute:', sql, params);
  }
}

const MIGRATIONS = `
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    option_e TEXT,
    option_f TEXT,
    option_g TEXT,
    option_h TEXT,
    option_i TEXT,
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    remediation_notes TEXT,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    tags TEXT NOT NULL,
    domain_id INTEGER NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice',
    scenario TEXT
);

CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_uid TEXT UNIQUE NOT NULL,
    attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    last_attempt_timestamp INTEGER,
    mastery_score REAL DEFAULT 0.0,
    difficulty_rating INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_timestamp INTEGER NOT NULL,
    end_timestamp INTEGER,
    duration_seconds INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    session_type TEXT NOT NULL,
    session_metadata TEXT
);

CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    rarity TEXT NOT NULL,
    is_unlocked INTEGER DEFAULT 0,
    unlock_timestamp INTEGER,
    progress INTEGER DEFAULT 0,
    requirement_value INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    timestamp INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT DEFAULT 'AI Trainee',
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    last_study_date INTEGER
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS event_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    event_timestamp INTEGER NOT NULL,
    payload TEXT
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_questions_uid ON questions(uid);
CREATE INDEX IF NOT EXISTS idx_questions_domain ON questions(domain_id);
CREATE INDEX IF NOT EXISTS idx_progress_uid ON user_progress(question_uid);
CREATE INDEX IF NOT EXISTS idx_sessions_timestamp ON study_sessions(start_timestamp);
`;

export async function getDb(): Promise<Database | MockDatabase> {
    if (db) return db;

    // Always try real SQLite first. If unavailable (browser/dev), fall back to mock DB.
    try {
        db = await Database.load('sqlite:ai_study_game.db');
    } catch (error) {
        console.warn('[DEV MODE] Using mock database. Real SQLite only available in Tauri desktop app.', error);
        return new MockDatabase() as any;
    }
    
    // Split migrations by semicolon and run each
    const statements = MIGRATIONS.split(';').filter(s => s.trim().length > 0);
    for (const statement of statements) {
        await db.execute(statement);
    }
    
    // Manual column migration for existing databases
    try {
        await db.execute("ALTER TABLE questions ADD COLUMN question_type TEXT DEFAULT 'multiple_choice'");
    } catch (e) {}
    
    try {
        await db.execute("ALTER TABLE questions ADD COLUMN scenario TEXT");
    } catch (e) {}

    try {
        await db.execute("ALTER TABLE study_sessions ADD COLUMN duration_seconds INTEGER DEFAULT 0");
    } catch (e) {}

    try {
        await db.execute("ALTER TABLE questions ADD COLUMN remediation_notes TEXT");
    } catch (e) {}

    // Check version and force re-seed if needed
    const versionRes = await db.select<{ value: string }[]>("SELECT value FROM settings WHERE key = 'db_version'");
    const currentVersion = versionRes.length > 0 ? parseInt(versionRes[0].value) : 1;

    if (currentVersion < 18) {
        // Clear questions to force a fresh seed — picks up new premium content
        await db.execute("DELETE FROM questions");
        await db.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('db_version', '18')");
    }
    
    return db;
}

// Helper to check if seeding is needed
export async function isDatabaseEmpty(): Promise<boolean> {
    const database = await getDb();
    const result = await database.select<{ count: number }[]>('SELECT COUNT(*) as count FROM questions');
    return result[0].count === 0;
}

export async function forceReSeedQuestions(): Promise<void> {
    const database = await getDb();
    // Clear only questions table
    await database.execute("DELETE FROM questions");
    // Reset version to ensure seed picks it up
    await database.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('db_version', '1')");
}

export async function executeSystemPurge(): Promise<void> {
    const database = await getDb();
    
    // Clear study data
    await database.execute("DELETE FROM user_progress");
    await database.execute("DELETE FROM study_sessions");
    await database.execute("DELETE FROM achievements");
    await database.execute("DELETE FROM search_history");
    await database.execute("DELETE FROM user_profile");
    
    // Reset DB version to force a re-seed of questions
    await database.execute("DELETE FROM questions");
    await database.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('db_version', '1')");
    
    // Reset streak and points in the profile row.
    await database.execute("INSERT OR IGNORE INTO user_profile (id, username, total_points, current_streak) VALUES (1, 'AI Trainee', 0, 0)");
    await database.execute("UPDATE user_profile SET total_points = 0, current_streak = 0 WHERE id = 1");
}
