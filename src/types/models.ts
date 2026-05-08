// src/types/question.ts
export interface Question {
  id?: number;
  uid: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e?: string;
  option_f?: string;
  option_g?: string;
  option_h?: string;
  option_i?: string;
  correct_answer: string;
  explanation: string;
  remediation_notes?: string; // Actionable "how to remember this" content shown after wrong answers
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "adaptive";
  tags: string[]; // JSON string in DB, array in TS
  domain_id: number;
  question_type: 'multiple_choice' | 'multiple_response' | 'ordering' | 'case_study' | 'fill_in_blank';
  scenario?: string;
}

export type QuizMode = 'practice' | 'timed' | 'adaptive';
export type ExamDifficulty = 'easy' | 'medium' | 'hard';

export interface TopicPerformance {
  asked: number;
  correct: number;
  totalTimeMs: number;
  averageTimeMs: number;
  accuracy: number;
  classification: 'weak' | 'medium' | 'strong';
}

export interface SessionQuestionMetric {
  question_uid: string;
  category: string;
  correct: boolean;
  time_spent_ms: number;
  difficulty: ExamDifficulty;
}

export interface SessionMetadata {
  quiz_mode?: QuizMode;
  track_tag?: string | null;
  target_difficulty?: ExamDifficulty;
  question_metrics?: SessionQuestionMetric[];
  topic_performance?: Record<string, TopicPerformance>;
  weak_areas?: string[];
  strong_areas?: string[];
  slow_responses?: string[];
}

// src/types/userProgress.ts
export interface UserProgress {
  id?: number;
  question_uid: string;
  attempts: number;
  correct_attempts: number;
  last_attempt_timestamp: number;
  mastery_score: number; // 0.0 to 1.0
  difficulty_rating: number; // User feedback difficulty
}

// src/types/studySession.ts
export interface StudySession {
  id?: number;
  start_timestamp: number;
  end_timestamp?: number;
  total_questions: number;
  correct_answers: number;
  session_type: "mixed" | "domain" | "concept" | "weakness" | "fill_in_blank";
  session_metadata?: string; // JSON string
}

// src/types/achievement.ts
export interface Achievement {
  id: string; // Unique ID like "first_quiz"
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  is_unlocked: boolean;
  unlock_timestamp?: number;
  progress: number; // 0 to 100
  requirement_value: number;
}

// src/types/settings.ts
export interface Settings {
  theme: "system" | "light" | "dark";
  quiz_timer_enabled: boolean;
  quiz_timer_seconds: number;
  verbosity_level: "concise" | "detailed";
  daily_goal_questions: number;
  sound_enabled: boolean;
}

// src/types/searchHistory.ts
export interface SearchHistory {
  id?: number;
  query: string;
  timestamp: number;
}

// src/types/userProfile.ts
export interface UserProfile {
  id?: number;
  username: string;
  total_points: number;
  current_streak: number;
  last_study_date?: number;
}
