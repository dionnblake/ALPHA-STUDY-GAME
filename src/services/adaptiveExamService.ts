import { ExamDifficulty, Question, SessionQuestionMetric, TopicPerformance } from '../types/models';

export function inferExamDifficulty(question: Question): ExamDifficulty {
  if (question.question_type === 'case_study' || question.question_type === 'ordering') {
    return 'hard';
  }

  if (question.scenario?.trim()) {
    return 'hard';
  }

  if (question.question_type === 'multiple_response') {
    return 'medium';
  }

  switch (question.difficulty) {
    case 'advanced':
      return 'hard';
    case 'intermediate':
    case 'adaptive':
      return 'medium';
    case 'beginner':
    default:
      return 'easy';
  }
}

export function getDifficultyWeight(questionDifficulty: ExamDifficulty, targetDifficulty: ExamDifficulty) {
  if (questionDifficulty === targetDifficulty) return 1;
  if (
    (questionDifficulty === 'easy' && targetDifficulty === 'medium') ||
    (questionDifficulty === 'medium' && targetDifficulty === 'easy') ||
    (questionDifficulty === 'medium' && targetDifficulty === 'hard') ||
    (questionDifficulty === 'hard' && targetDifficulty === 'medium')
  ) {
    return 0.65;
  }
  return 0.3;
}

export function adjustDifficulty(current: ExamDifficulty, wasCorrect: boolean): ExamDifficulty {
  if (wasCorrect) {
    if (current === 'easy') return 'medium';
    if (current === 'medium') return 'hard';
    return 'hard';
  }

  if (current === 'hard') return 'medium';
  if (current === 'medium') return 'easy';
  return 'easy';
}

export function buildTopicPerformance(metrics: SessionQuestionMetric[]) {
  const topicMap = new Map<string, TopicPerformance>();

  metrics.forEach((metric) => {
    const current = topicMap.get(metric.category) || {
      asked: 0,
      correct: 0,
      totalTimeMs: 0,
      averageTimeMs: 0,
      accuracy: 0,
      classification: 'medium' as const
    };

    current.asked += 1;
    current.correct += metric.correct ? 1 : 0;
    current.totalTimeMs += metric.time_spent_ms;
    current.averageTimeMs = Math.round(current.totalTimeMs / current.asked);
    current.accuracy = Math.round((current.correct / current.asked) * 100);
    current.classification =
      current.accuracy < 60 ? 'weak' :
      current.accuracy <= 80 ? 'medium' :
      'strong';

    topicMap.set(metric.category, current);
  });

  return Object.fromEntries(topicMap.entries());
}

export function chooseAdaptiveQuestion(
  remainingQuestions: Question[],
  targetDifficulty: ExamDifficulty,
  topicPerformance: Record<string, TopicPerformance>,
  recentlyUsedCategories: string[]
) {
  if (remainingQuestions.length === 0) return null;

  const recentSet = new Set(recentlyUsedCategories.slice(-2));

  const scored = remainingQuestions.map((question) => {
    const questionDifficulty = inferExamDifficulty(question);
    const topic = question.category || 'general';
    const topicStats = topicPerformance[topic];
    const topicBoost =
      !topicStats ? 1.1 :
      topicStats.classification === 'weak' ? 1.45 :
      topicStats.classification === 'medium' ? 1.0 :
      0.7;

    const recencyPenalty = recentSet.has(topic) ? 0.65 : 1;
    const difficultyWeight = getDifficultyWeight(questionDifficulty, targetDifficulty);
    const randomness = 0.7 + Math.random() * 0.6; // Increased randomness range

    return {
      question,
      score: topicBoost * recencyPenalty * difficultyWeight * randomness
    };
  });

  scored.sort((a, b) => b.score - a.score);
  
  // Pick from the top 3 high-scoring questions to ensure variety
  const topCandidates = Math.min(scored.length, 3);
  const randomIndex = Math.floor(Math.random() * topCandidates);
  return scored[randomIndex]?.question ?? null;
}
