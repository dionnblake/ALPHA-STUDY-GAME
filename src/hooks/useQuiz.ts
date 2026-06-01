import { useState, useEffect, useCallback, useRef, type MutableRefObject } from 'react';
import { ExamDifficulty, Question, QuizMode, SessionQuestionMetric, TopicPerformance } from '../types/models';
import { getQuestionPool, buildStudyQueue, updateMastery, StudyQueueType } from '../services/spacedRepService';
import { adjustDifficulty, buildTopicPerformance, chooseAdaptiveQuestion, inferExamDifficulty } from '../services/adaptiveExamService';
import { startSession, recordResponse, endSession, updateSessionMetadata } from '../services/sessionService';
import { getSettings } from '../services/settingsService';
import { seedDatabase } from '../services/seedingService';

type QuizState = 'loading' | 'active' | 'feedback' | 'finished';

function getQuestionType(type: "mixed" | "domain" | "fill_in_blank"): StudyQueueType {
    return type;
}

function getTimeSpent(questionStartRef: MutableRefObject<number>) {
    return Math.max(1000, Date.now() - questionStartRef.current);
}

export function useQuiz(
    type: "mixed" | "domain" | "fill_in_blank",
    domainId?: number,
    initialCount: number = 20,
    trackTag?: string,
    mode: QuizMode = 'timed'
) {
    const [questionPool, setQuestionPool] = useState<Question[]>([]);
    const [queue, setQueue] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [state, setState] = useState<QuizState>('loading');
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
    const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [timerSettings, setTimerSettings] = useState({ enabled: true, seconds: 60 });
    const [timeLeft, setTimeLeft] = useState(60);
    const [timeLimitMinutes, setTimeLimitMinutes] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [targetDifficulty, setTargetDifficulty] = useState<ExamDifficulty>('medium');
    const [difficultyAdjustment, setDifficultyAdjustment] = useState<'increased' | 'decreased' | 'maintained'>('maintained');
    const [topicFocus, setTopicFocus] = useState<'increased' | 'reduced' | 'maintained'>('maintained');
    const [questionMetrics, setQuestionMetrics] = useState<SessionQuestionMetric[]>([]);
    const [topicPerformance, setTopicPerformance] = useState<Record<string, TopicPerformance>>({});

    const timerRef = useRef<number | null>(null);
    const questionStartRef = useRef(Date.now());
    // Stable ref to always-current handleTimeUp, so the timer interval never closes over stale state.
    const handleTimeUpRef = useRef<(() => Promise<void>) | null>(null);

    const currentQuestion = queue[currentIndex];

    const pushAdaptiveQuestion = useCallback((pool: Question[], askedQuestions: Question[], currentTopicPerformance: Record<string, TopicPerformance>, nextDifficulty: ExamDifficulty) => {
        const usedIds = new Set(askedQuestions.map((question) => question.uid));
        const remainingQuestions = pool.filter((question) => !usedIds.has(question.uid));
        const recentlyUsedCategories = askedQuestions.map((question) => question.category || 'general');
        const nextQuestion = chooseAdaptiveQuestion(remainingQuestions, nextDifficulty, currentTopicPerformance, recentlyUsedCategories);

        if (!nextQuestion) return null;
        return nextQuestion;
    }, []);

    useEffect(() => {
        async function init() {
            try {
                const settings = await getSettings();
                const isTimedMode = mode === 'timed';
                const secondsPerQuestion = isTimedMode ? settings.quiz_timer_seconds : 0;
                const limitMinutes = isTimedMode
                    ? Math.ceil((initialCount <= 50 ? initialCount * 1.2 : initialCount * 0.9))
                    : 0;

                setTimerSettings({ enabled: isTimedMode && settings.quiz_timer_enabled, seconds: secondsPerQuestion });
                setTimeLeft(secondsPerQuestion);
                setTimeLimitMinutes(limitMinutes);

                await startSession(getQuestionType(type), {
                    quiz_mode: mode,
                    track_tag: trackTag || null,
                    target_difficulty: 'medium',
                    question_metrics: []
                });

                let initialQueue: Question[] = [];
                let pool: Question[] = [];

                if (mode === 'adaptive') {
                    const result = await getQuestionPool(getQuestionType(type), domainId, trackTag);
                    pool = result.questions;
                    if (pool.length === 0) {
                        await seedDatabase(() => {});
                        const retry = await getQuestionPool(getQuestionType(type), domainId, trackTag);
                        pool = retry.questions;
                    }

                    const firstQuestion = pushAdaptiveQuestion(pool, [], {}, 'medium');
                    if (firstQuestion) {
                        initialQueue = [firstQuestion];
                    }
                } else {
                    initialQueue = await buildStudyQueue(initialCount, getQuestionType(type), domainId, trackTag);
                    pool = initialQueue;

                    if (initialQueue.length === 0) {
                        await seedDatabase(() => {});
                        initialQueue = await buildStudyQueue(initialCount, getQuestionType(type), domainId, trackTag);
                        pool = initialQueue;
                    }
                }

                if (initialQueue.length === 0) {
                    throw new Error(
                        type === 'fill_in_blank'
                            ? 'No fill-in-the-blank questions are available in the current question bank.'
                            : 'No questions are available in the current question bank. Re-run the question import and try again.'
                    );
                }

                setQuestionPool(pool);
                setQueue(initialQueue);
                setState('active');
                questionStartRef.current = Date.now();
            } catch (err) {
                console.error("Quiz init error:", err);
                setError(err instanceof Error ? err.message : String(err));
            }
        }
        init();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [type, domainId, initialCount, trackTag, mode, pushAdaptiveQuestion]);

    useEffect(() => {
        if (state === 'active' && timerSettings.enabled && !isPaused) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        void handleTimeUpRef.current?.();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state, timerSettings.enabled, isPaused]);

    const handleTimeUp = useCallback(async () => {
        if (!currentQuestion) return;

        const timeSpentMs = getTimeSpent(questionStartRef);
        const difficulty = inferExamDifficulty(currentQuestion);
        const nextMetric: SessionQuestionMetric = {
            question_uid: currentQuestion.uid,
            category: currentQuestion.category || 'general',
            correct: false,
            time_spent_ms: timeSpentMs,
            difficulty
        };
        const nextMetrics = [...questionMetrics, nextMetric];
        const nextTopicPerformance = buildTopicPerformance(nextMetrics);

        setSelectedLetter(null);
        setSelectedLetters([]);
        setIsCorrect(false);
        setQuestionMetrics(nextMetrics);
        setTopicPerformance(nextTopicPerformance);
        await updateSessionMetadata({
            question_metrics: nextMetrics,
            target_difficulty: targetDifficulty
        });
        await recordResponse(false);
        await updateMastery(currentQuestion.uid, false);

        if (mode === 'timed') {
            await moveToNextQuestion(nextMetrics, nextTopicPerformance, targetDifficulty);
            return;
        }

        setDifficultyAdjustment(mode === 'adaptive' ? 'decreased' : 'maintained');
        setTopicFocus(nextTopicPerformance[currentQuestion.category || 'general']?.classification === 'weak' ? 'increased' : 'maintained');
        setState('feedback');
    }, [currentQuestion, mode, questionMetrics, targetDifficulty]);

    // Keep the ref in sync so the timer interval always calls the latest closure.
    handleTimeUpRef.current = handleTimeUp;

    const evaluateAnswer = useCallback((currentQ: Question, answer: string | string[]) => {
        let correct = false;
        const qType = currentQ.question_type || 'multiple_choice';

        const getOptionTextByLetter = (letter: string) => {
            switch (letter.toUpperCase()) {
                case 'A': return currentQ.option_a;
                case 'B': return currentQ.option_b;
                case 'C': return currentQ.option_c;
                case 'D': return currentQ.option_d;
                case 'E': return currentQ.option_e;
                case 'F': return currentQ.option_f;
                case 'G': return currentQ.option_g;
                case 'H': return currentQ.option_h;
                case 'I': return currentQ.option_i;
                default: return undefined;
            }
        };

        if (qType === 'multiple_choice' || qType === 'case_study' || qType === 'fill_in_blank') {
            const letter = (typeof answer === 'string' ? (answer || '') : (answer[0] || '')).toUpperCase().trim();
            const actual = (currentQ.correct_answer || '').trim();
            const optText = getOptionTextByLetter(letter);

            correct = letter === actual.toUpperCase() ||
                (optText ? optText.toLowerCase() === actual.toLowerCase() : false);

            setSelectedLetter(letter);
        } else if (qType === 'multiple_response') {
            const selected = (Array.isArray(answer) ? [...answer] : [answer]).map(s => s.toUpperCase().trim()).sort();
            const actualArr = (currentQ.correct_answer || '').split(',').map(s => s.trim());
            const selectedMatchIndices = new Set<number>();
            const actualMatchIndices = new Set<number>();

            selected.forEach((selLetter, sIdx) => {
                const selText = getOptionTextByLetter(selLetter);
                actualArr.forEach((actVal, aIdx) => {
                    const matches = selLetter === actVal.toUpperCase() ||
                        (selText ? selText.toLowerCase() === actVal.toLowerCase() : false);
                    if (matches) {
                        selectedMatchIndices.add(sIdx);
                        actualMatchIndices.add(aIdx);
                    }
                });
            });

            correct = selectedMatchIndices.size === selected.length && actualMatchIndices.size === actualArr.length;
            setSelectedLetters(selected);
            setSelectedLetter(selected.join(','));
        } else if (qType === 'ordering') {
            const selected = (Array.isArray(answer) ? [...answer] : [answer]).map(s => s.toUpperCase().trim());
            const actualArr = (currentQ.correct_answer || '').split(',').map(s => s.trim());

            correct = selected.length === actualArr.length && selected.every((selLetter, idx) => {
                const selText = getOptionTextByLetter(selLetter);
                const actVal = actualArr[idx];
                return selLetter === actVal.toUpperCase() ||
                    (selText ? selText.toLowerCase() === actVal.toLowerCase() : false);
            });

            setSelectedLetters(selected);
            setSelectedLetter(selected.join(','));
        }

        return correct;
    }, []);

    const moveToNextQuestion = useCallback(async (
        metricsOverride = questionMetrics,
        topicPerformanceOverride = topicPerformance,
        targetDifficultyOverride = targetDifficulty
    ) => {
        if (currentIndex < queue.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedLetter(null);
            setSelectedLetters([]);
            setIsCorrect(null);
            setTimeLeft(timerSettings.seconds);
            setState('active');
            questionStartRef.current = Date.now();
            return;
        }

        if (mode === 'adaptive' && queue.length < initialCount) {
            const nextQuestion = pushAdaptiveQuestion(questionPool, queue, topicPerformanceOverride, targetDifficultyOverride);
            if (nextQuestion) {
                setQueue(prev => [...prev, nextQuestion]);
                setCurrentIndex(prev => prev + 1);
                setSelectedLetter(null);
                setSelectedLetters([]);
                setIsCorrect(null);
                setTimeLeft(timerSettings.seconds);
                setState('active');
                questionStartRef.current = Date.now();
                return;
            }
        }

        await updateSessionMetadata({
            question_metrics: metricsOverride,
            target_difficulty: targetDifficultyOverride
        });
        const sid = await endSession();
        setSessionId(sid);
        setState('finished');
    }, [currentIndex, initialCount, mode, pushAdaptiveQuestion, queue, questionMetrics, questionPool, targetDifficulty, timerSettings.seconds, topicPerformance]);

    const submitAnswer = useCallback(async (answer: string | string[]) => {
        if (state !== 'active' || !currentQuestion) return;

        const correct = evaluateAnswer(currentQuestion, answer);
        const timeSpentMs = getTimeSpent(questionStartRef);
        const difficulty = inferExamDifficulty(currentQuestion);
        const nextMetric: SessionQuestionMetric = {
            question_uid: currentQuestion.uid,
            category: currentQuestion.category || 'general',
            correct,
            time_spent_ms: timeSpentMs,
            difficulty
        };
        const nextMetrics = [...questionMetrics, nextMetric];
        const nextTopicPerformance = buildTopicPerformance(nextMetrics);
        const nextDifficulty = mode === 'adaptive'
            ? adjustDifficulty(targetDifficulty, correct)
            : targetDifficulty;

        setQuestionMetrics(nextMetrics);
        setTopicPerformance(nextTopicPerformance);
        setTargetDifficulty(nextDifficulty);
        setDifficultyAdjustment(
            nextDifficulty === targetDifficulty ? 'maintained' :
            nextDifficulty === 'hard' || (targetDifficulty === 'easy' && nextDifficulty === 'medium') ? 'increased' :
            'decreased'
        );

        const categoryStats = nextTopicPerformance[currentQuestion.category || 'general'];
        setTopicFocus(
            categoryStats?.classification === 'weak' ? 'increased' :
            categoryStats?.classification === 'strong' ? 'reduced' :
            'maintained'
        );

        setIsCorrect(correct);

        await recordResponse(correct);
        await updateMastery(currentQuestion.uid, correct);
        await updateSessionMetadata({
            question_metrics: nextMetrics,
            target_difficulty: nextDifficulty,
            slow_responses: nextMetrics
                .filter((metric) => metric.time_spent_ms > 45000)
                .map((metric) => metric.question_uid)
        });

        if (mode === 'timed') {
            await moveToNextQuestion(nextMetrics, nextTopicPerformance, nextDifficulty);
            return;
        }

        setState('feedback');
    }, [state, currentQuestion, evaluateAnswer, questionMetrics, mode, targetDifficulty, moveToNextQuestion]);

    const selectOption = useCallback((letter: string) => {
        if (state !== 'active' || !currentQuestion) return;
        const qType = currentQuestion.question_type || 'multiple_choice';

        if (qType === 'multiple_choice' || qType === 'case_study' || qType === 'fill_in_blank') {
            setSelectedLetter(letter);
        } else {
            setSelectedLetters(prev => prev.includes(letter) ? prev.filter(l => l !== letter) : [...prev, letter]);
        }
    }, [state, currentQuestion]);

    const finalizeAnswer = useCallback(() => {
        if (state !== 'active' || !currentQuestion) return;
        const qType = currentQuestion.question_type || 'multiple_choice';

        if (qType === 'multiple_choice' || qType === 'case_study' || qType === 'fill_in_blank') {
            if (!selectedLetter) return;
            void submitAnswer(selectedLetter);
            return;
        }

        if (selectedLetters.length === 0) return;
        void submitAnswer(selectedLetters);
    }, [state, currentQuestion, selectedLetter, selectedLetters, submitAnswer]);

    const nextQuestion = useCallback(async () => {
        if (state !== 'feedback') return;
        await moveToNextQuestion();
    }, [state, moveToNextQuestion]);

    const togglePause = useCallback(() => {
        if (state === 'active' && mode !== 'practice') {
            setIsPaused(p => !p);
        }
    }, [state, mode]);

    return {
        state,
        currentQuestion,
        currentIndex,
        totalQuestions: mode === 'adaptive' ? Math.max(queue.length, initialCount) : queue.length,
        selectedLetter,
        selectedLetters,
        isCorrect,
        timeLeft,
        timerEnabled: timerSettings.enabled,
        isPaused,
        sessionId,
        error,
        mode,
        timeLimitMinutes,
        targetDifficulty,
        difficultyAdjustment,
        topicFocus,
        topicPerformance,
        submitAnswer,
        selectOption,
        finalizeAnswer,
        nextQuestion,
        togglePause
    };
}
