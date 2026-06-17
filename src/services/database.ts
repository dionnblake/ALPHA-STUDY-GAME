// src/services/database.ts
import Database from '@tauri-apps/plugin-sql';

let db: Database | null = null;

// In-memory database for browser/Vite dev mode.
// Tauri SQLite is unavailable in a normal browser, but the app still needs
// quiz/search/progress smoke tests to work during development.
type MockQuestion = Record<string, any>;
type MockProgress = Record<string, any>;
type MockSession = Record<string, any>;

const mockState = {
  questions: [] as MockQuestion[],
  user_progress: [] as MockProgress[],
  study_sessions: [] as MockSession[],
  achievements: [] as Record<string, any>[],
  search_history: [] as Record<string, any>[],
  user_profile: [{ id: 1, username: 'AI Trainee', total_points: 0, current_streak: 0, last_study_date: null }] as Record<string, any>[],
  settings: new Map<string, string>(),
  nextSessionId: 1,
  nextHistoryId: 1
};

function cloneRows<T>(rows: T[]): T[] {
  return rows.map((row) => ({ ...(row as any) })) as T[];
}

function textBlob(question: MockQuestion) {
  return [
    question.question_text, question.explanation, question.tags, question.category,
    question.option_a, question.option_b, question.option_c, question.option_d,
    question.option_e, question.option_f, question.option_g, question.option_h,
    question.option_i, question.scenario, question.remediation_notes
  ].filter(Boolean).join(' ').toLowerCase();
}

class MockDatabase {
  async select<T>(sql: string, params: any[] = []): Promise<T> {
    const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase();

    if (normalized.includes('count(*)') && normalized.includes('from questions') && !normalized.includes('group by')) {
      return [{ count: mockState.questions.length }] as any;
    }

    if (normalized.includes('select value from settings')) {
      const key = params[0] ?? 'db_version';
      const value = mockState.settings.get(String(key));
      return (value === undefined ? [] : [{ value }]) as any;
    }

    if (normalized.startsWith('select * from settings')) {
      return Array.from(mockState.settings.entries()).map(([key, value]) => ({ key, value })) as any;
    }

    if (normalized.includes('from user_progress')) {
      if (normalized.includes('where question_uid = ?')) {
        return cloneRows(mockState.user_progress.filter((row) => row.question_uid === params[0])) as any;
      }
      return cloneRows(mockState.user_progress) as any;
    }

    if (normalized.includes('from search_history')) {
      return cloneRows([...mockState.search_history].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)) as any;
    }

    if (normalized.includes('from questions') && normalized.includes('group by category')) {
      const counts = new Map<string, number>();
      for (const q of mockState.questions) {
        if (!q.category || !String(q.category).trim()) continue;
        counts.set(q.category, (counts.get(q.category) || 0) + 1);
      }
      return Array.from(counts.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category))
        .slice(0, 5) as any;
    }

    if (normalized.includes('from questions')) {
      let rows = mockState.questions;
      if (normalized.includes('where domain_id = ?')) {
        rows = rows.filter((q) => q.domain_id === params[0]);
      } else if (normalized.includes("where question_type = 'fill_in_blank'")) {
        rows = rows.filter((q) => q.question_type === 'fill_in_blank');
      } else if (normalized.includes("where uid like 'google_fib_%'")) {
        rows = rows.filter((q) => String(q.uid || '').startsWith('google_fib_'));
      } else if (normalized.includes(' like ?')) {
        const terms = params
          .filter((param) => typeof param === 'string' && param.includes('%'))
          .map((param) => param.replace(/%/g, '').toLowerCase().trim())
          .filter(Boolean);
        rows = rows.filter((q) => terms.length === 0 || terms.some((term) => textBlob(q).includes(term)));
      }
      const limitedRows = normalized.includes(' like ?') ? rows.slice(0, 250) : rows;
      return cloneRows(limitedRows) as any;
    }

    if (normalized.includes('from study_sessions')) return cloneRows(mockState.study_sessions) as any;
    if (normalized.includes('from achievements')) return cloneRows(mockState.achievements) as any;
    if (normalized.includes('from user_profile')) return cloneRows(mockState.user_profile) as any;

    return [] as any;
  }

  async execute(sql: string, params: any[] = []): Promise<any> {
    const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase();

    if (normalized.startsWith('delete from questions')) { mockState.questions = []; return; }
    if (normalized.startsWith('delete from user_progress')) { mockState.user_progress = []; return; }
    if (normalized.startsWith('delete from study_sessions')) { mockState.study_sessions = []; return; }
    if (normalized.startsWith('delete from achievements')) { mockState.achievements = []; return; }
    if (normalized.startsWith('delete from search_history')) { mockState.search_history = []; return; }
    if (normalized.startsWith('delete from user_profile')) { mockState.user_profile = []; return; }

    if (normalized.includes('insert or replace into settings')) {
      mockState.settings.set(String(params[0]), String(params[1]));
      return;
    }

    if (normalized.includes('insert or ignore into user_profile')) {
      if (!mockState.user_profile.some((row) => row.id === 1)) {
        mockState.user_profile.push({ id: 1, username: 'AI Trainee', total_points: 0, current_streak: 0, last_study_date: null });
      }
      return;
    }

    if (normalized.startsWith('update user_profile set total_points = total_points + ?')) {
      const profile = mockState.user_profile[0] || (mockState.user_profile[0] = { id: 1, total_points: 0, current_streak: 0 });
      profile.total_points = (profile.total_points || 0) + Number(params[0] || 0);
      return;
    }

    if (normalized.startsWith('update user_profile set total_points = 0')) {
      const profile = mockState.user_profile[0] || (mockState.user_profile[0] = { id: 1 });
      profile.total_points = 0;
      profile.current_streak = 0;
      return;
    }

    if (normalized.includes('insert or ignore into achievements')) {
      if (!mockState.achievements.some((row) => row.id === params[0])) {
        mockState.achievements.push({ id: params[0], name: params[1], description: params[2], icon: params[3], rarity: params[4], requirement_value: params[5], is_unlocked: 0, progress: 0 });
      }
      return;
    }

    if (normalized.includes('insert or replace into questions')) {
      const row = {
        uid: params[0], question_text: params[1], option_a: params[2], option_b: params[3], option_c: params[4], option_d: params[5],
        option_e: params[6], option_f: params[7], option_g: params[8], option_h: params[9], option_i: params[10], correct_answer: params[11],
        explanation: params[12], remediation_notes: params[13], category: params[14], difficulty: params[15], tags: params[16], domain_id: params[17],
        question_type: params[18], scenario: params[19]
      };
      const index = mockState.questions.findIndex((q) => q.uid === row.uid);
      if (index >= 0) mockState.questions[index] = row; else mockState.questions.push(row);
      return;
    }

    if (normalized.includes('insert or replace into user_progress')) {
      const row = { question_uid: params[0], attempts: params[1], correct_attempts: params[2], last_attempt_timestamp: params[3], mastery_score: params[4], difficulty_rating: params[5] };
      const index = mockState.user_progress.findIndex((progress) => progress.question_uid === row.question_uid);
      if (index >= 0) mockState.user_progress[index] = row; else mockState.user_progress.push(row);
      return;
    }

    if (normalized.includes('insert into study_sessions')) {
      const id = mockState.nextSessionId++;
      mockState.study_sessions.push({ id, start_timestamp: params[0], end_timestamp: params[1], duration_seconds: params[2], total_questions: params[3], correct_answers: params[4], session_type: params[5], session_metadata: params[6] });
      return { lastInsertId: id };
    }

    if (normalized.includes('insert into search_history')) {
      mockState.search_history.push({ id: mockState.nextHistoryId++, query: params[0], timestamp: params[1] });
      return;
    }
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
    // The mock is gated behind import.meta.env.DEV so Rollup tree-shakes MockDatabase
    // out of production builds, where Tauri SQLite is always available.
    try {
        db = await Database.load('sqlite:ai_study_game.db');
    } catch (error) {
        if (import.meta.env.DEV) {
            console.warn('[DEV MODE] Using mock database. Real SQLite only available in Tauri desktop app.', error);
            return new MockDatabase() as any;
        }
        console.error('Failed to load SQLite database in production build.', error);
        throw new Error('Unable to open the local SQLite database. The app cannot run without it.');
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

    if (currentVersion < 20) {
        // Clear questions to force a fresh seed — full AWS practitioner rebuild from transcript
        await db.execute("DELETE FROM questions");
        await db.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('db_version', '20')");
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
    // Mark the content refresh point so dashboards can ignore stale study data from prior mission banks.
    await database.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('mission_data_refreshed_at', ?)",
        [Date.now().toString()]
    );
    // Invalidate the singleton so next getDb() re-runs the migration gate
    db = null;
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
    await database.execute(
        "INSERT OR REPLACE INTO settings (key, value) VALUES ('mission_data_refreshed_at', ?)",
        [Date.now().toString()]
    );
    
    // Reset streak and points in the profile row.
    await database.execute("INSERT OR IGNORE INTO user_profile (id, username, total_points, current_streak) VALUES (1, 'AI Trainee', 0, 0)");
    await database.execute("UPDATE user_profile SET total_points = 0, current_streak = 0 WHERE id = 1");
}
