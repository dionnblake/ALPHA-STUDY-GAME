// src/screens/QuizScreen.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { CheckCircle, XCircle, ArrowRight, Pause, Database, Timer, Info } from 'lucide-react';
import { FillInBlankQuestion } from '../components/FillInBlankQuestion';
import { logGrowthEvent, parseChallengeToken } from '../services/growthService';
import { QuizMode } from '../types/models';
import './QuizScreen.css';

export function QuizScreen() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = window.location.hash;

    // Detect fill_in_blank from URL path
    let type = (searchParams.get('type') || 'mixed') as any;
    if (location.includes('/fill-in-blank')) {
        type = 'fill_in_blank';
    }
    const trackTagFromPath = location.includes('/generative-ai-leader')
        ? 'google-generative-ai-leader'
        : undefined;
    const trackTag = searchParams.get('track') || trackTagFromPath;
    const modeParam = (searchParams.get('mode') || 'practice').toLowerCase();
    const quizMode: QuizMode = modeParam === 'practice' || modeParam === 'adaptive' ? modeParam : 'timed';
    const showExplanations = searchParams.get('explain') === '1' || quizMode !== 'timed';

    const domainId = searchParams.get('domainId') ? parseInt(searchParams.get('domainId') as string) : undefined;
    const challenge = parseChallengeToken(searchParams.get('challenge'));

    const {
        state, currentQuestion, currentIndex, totalQuestions,
        selectedLetter, selectedLetters, isCorrect, timeLeft, isPaused,
        sessionId, error, submitAnswer, selectOption, finalizeAnswer, nextQuestion, togglePause,
        mode, timeLimitMinutes, targetDifficulty, difficultyAdjustment, topicFocus
    } = useQuiz(type, domainId, 20, trackTag || undefined, quizMode);





    useEffect(() => {
        if (!challenge) return;
        logGrowthEvent('invite_accepted', {
            targetAccuracy: challenge.accuracy,
            targetPoints: challenge.pointsEarned
        }).catch((error) => {
            console.error('Failed to log invite acceptance', error);
        });
    }, [challenge]);

    // Keyboard bindings
    useKeyboardShortcuts({
        '1': () => selectOption('A'), '2': () => selectOption('B'),
        '3': () => selectOption('C'), '4': () => selectOption('D'),
        '5': () => selectOption('E'), '6': () => selectOption('F'),
        'a': () => selectOption('A'), 'b': () => selectOption('B'),
        'c': () => selectOption('C'), 'd': () => selectOption('D'),
        'e': () => selectOption('E'), 'enter': () => {
            if (state === 'feedback') nextQuestion();
            else finalizeAnswer();
        },
        's': () => submitAnswer('SKIP'),
        'escape': () => navigate('/')
    }, state !== 'loading' && state !== 'finished');

    // Handle Finish
    useEffect(() => {
        if (state === 'finished' && sessionId) {
            navigate(`/summary?sessionId=${sessionId}`);
        }
    }, [state, sessionId, navigate]);

    const [shuffledOptions, setShuffledOptions] = useState<{ letter: string; text: string }[]>([]);
    const qType = currentQuestion?.question_type || 'multiple_choice';

    useEffect(() => {
        if (currentQuestion && state === 'active') {
            const arr = [
                { letter: 'A', text: currentQuestion.option_a },
                { letter: 'B', text: currentQuestion.option_b },
                { letter: 'C', text: currentQuestion.option_c },
                { letter: 'D', text: currentQuestion.option_d },
                { letter: 'E', text: currentQuestion.option_e },
                { letter: 'F', text: currentQuestion.option_f },
                { letter: 'G', text: currentQuestion.option_g },
                { letter: 'H', text: currentQuestion.option_h },
                { letter: 'I', text: currentQuestion.option_i },
            ].filter((o): o is { letter: string; text: string } => !!(o.text && o.text.trim().length > 0));

            // Keep every question type shuffled so ordering prompts are not pre-sorted on screen.
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            setShuffledOptions(arr);
        }
    }, [currentQuestion?.uid, state, qType]);

    const options = shuffledOptions;
    const correctAnswerText = (() => {
        if (!currentQuestion) return '';
        const raw = (currentQuestion.correct_answer || '').trim();
        const direct = options.find((option) => option.letter.toUpperCase() === raw.toUpperCase());
        return direct?.text || raw;
    })();

    if (error) {
        return (
            <div className="page-container flex-center">
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', maxWidth: 500 }}>
                    <XCircle size={48} color="var(--color-error)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ color: 'var(--color-error)' }}>Neural Synthesis Failed</h2>
                    <p style={{ margin: '1rem 0', opacity: 0.8 }}>{error}</p>
                    <button className="btn-primary" onClick={() => navigate('/')}>Return to Dashboard</button>
                </div>
            </div>
        );
    }

    if (state === 'loading' || !currentQuestion) {
        return <div className="page-container flex-center"><h3>Calibrating Neural Net...</h3></div>;
    }

    return (
        <div className="quiz-screen">
            <header className="quiz-top-bar glass-panel">
                <div className="top-bar-left">
                    <div className="session-info">
                        <div className="session-badge" style={{ color: `var(--domain-${currentQuestion.domain_id || 1})` }}>
                            {(mode || 'TIMED').toUpperCase()} {(type || 'MIXED').toUpperCase()} SESSION
                        </div>
                        {challenge && (
                            <div className="question-count">
                                CHALLENGE TARGET <span className="highlight">{challenge.accuracy}%</span>
                            </div>
                        )}
                        <div className="question-count">
                            QUESTION <span className="highlight">{currentIndex + 1}</span> OF {totalQuestions}
                        </div>
                        {mode !== 'practice' && timeLimitMinutes > 0 && (
                            <div className="question-count">
                                SESSION LIMIT <span className="highlight">{timeLimitMinutes}M</span>
                            </div>
                        )}
                    </div>
                    <div className="progress-track">
                        <div className="progress-bar-bg">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="top-bar-center">
                    <div className="timer-badge">
                        <Timer size={16} />
                        <span className={timeLeft < 15 ? 'critical' : ''}>
                            {mode === 'practice' ? 'OPEN' : `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
                        </span>
                    </div>
                </div>

                <div className="top-bar-right">

                    {mode !== 'practice' && (
                        <button className="pause-btn interactive-surface" onClick={togglePause}>
                            <Pause size={18} />
                        </button>
                    )}
                </div>
            </header>

            <main className="quiz-container">
                <div className="question-scroll-area">
                    <div className={`question-area ${state === 'feedback' ? 'feedback-active' : ''}`}>
                        {isPaused ? (
                            <div className="pause-overlay glass-panel">
                                <Pause size={64} color="var(--primary)" />
                                <h2>SESSION SUSPENDED</h2>
                                <p className="text-muted">Neural link preserved. Click resume to continue.</p>
                                <button className="btn-primary" onClick={togglePause}>RESUME SESSION</button>
                            </div>
                        ) : (
                            <div className={`quiz-card-wrapper ${state === 'feedback' ? 'feedback-active' : ''}`}>
                                <div className="quiz-main-logic">
                                    <div className="question-category-label">
                                        {(currentQuestion.category || 'GENERAL AI KNOWLEDGE')} • {targetDifficulty.toUpperCase()}
                                    </div>

                                    {qType === 'fill_in_blank' ? (
                                        <FillInBlankQuestion
                                            question={currentQuestion}
                                            options={options}
                                            selectedLetter={selectedLetter}
                                            state={state as 'active' | 'feedback'}
                                            onSelectOption={selectOption}
                                        />
                                    ) : (
                                        <div className="question-body">
                                            {currentQuestion.question_text}
                                            {qType === 'multiple_response' && <div className="q-type-hint">CHOOSE ALL THAT APPLY</div>}
                                            {qType === 'ordering' && <div className="q-type-hint">DETERMINE CORRECT SEQUENCE</div>}
                                        </div>
                                    )}

                                    {currentQuestion.scenario && qType !== 'fill_in_blank' && (
                                        <div className="scenario-hud glass-panel">
                                            <div className="hud-header">
                                                <Database size={16} />
                                                <span>SCENARIO DATA BATCH</span>
                                                <div className="hud-pulse"></div>
                                            </div>
                                            <div className="scenario-content">
                                                {currentQuestion.scenario}
                                            </div>
                                        </div>
                                    )}

                                    {qType !== 'fill_in_blank' && <div className="options-stack">
                                        {options.map((opt) => {
                                            const isSelected = selectedLetters.includes(opt.letter) || selectedLetter === opt.letter;

                                            // Correct answer letters from DB (always stored as letters after seeding)
                                            const correctArr = (currentQuestion.correct_answer || '')
                                                .split(',')
                                                .map(a => a.trim().toUpperCase());

                                            const isActualCorrect = correctArr.includes(opt.letter.toUpperCase());

                                            // For ordering: show the position the USER chose while active
                                            // In feedback: show CORRECT position so user knows right sequence
                                            let displayKey: string | number = opt.letter;
                                            if (qType === 'ordering') {
                                                if (state === 'feedback') {
                                                    // Show the correct sequence position (1-based) for every option
                                                    const correctPos = correctArr.indexOf(opt.letter.toUpperCase()) + 1;
                                                    displayKey = correctPos > 0 ? correctPos : opt.letter;
                                                } else {
                                                    // Show the order the user clicked — 0 if not yet selected
                                                    const userPos = selectedLetters.indexOf(opt.letter) + 1;
                                                    displayKey = userPos > 0 ? userPos : opt.letter;
                                                }
                                            }

                                            let stateClass = '';
                                            if (state === 'feedback') {
                                                if (qType === 'ordering') {
                                                    // For ordering: correct means the user placed it in the right position
                                                    const userPos = selectedLetters.indexOf(opt.letter);
                                                    const correctPos = correctArr.indexOf(opt.letter.toUpperCase());
                                                    if (userPos !== -1 && userPos === correctPos) stateClass = 'correct';
                                                    else if (userPos !== -1 && userPos !== correctPos) stateClass = 'incorrect shake';
                                                    else stateClass = 'correct'; // unselected but correct — show right position
                                                } else {
                                                    if (isSelected && isActualCorrect) stateClass = 'correct';
                                                    else if (isSelected && !isActualCorrect) stateClass = 'incorrect shake';
                                                    else if (isActualCorrect) stateClass = 'correct';
                                                    else stateClass = 'disabled';
                                                }
                                            } else if (isSelected) {
                                                stateClass = 'selected';
                                            }

                                            return (
                                                <button
                                                    type="button"
                                                    key={opt.letter}
                                                    className={`option-hud-card interactive-surface ${stateClass}`}
                                                    aria-pressed={isSelected}
                                                    disabled={state === 'feedback'}
                                                    onClick={() => selectOption(opt.letter)}
                                                >
                                                    <div className="option-key">
                                                        {displayKey}
                                                    </div>
                                                    <div className="option-text">{opt.text}</div>
                                                    {state === 'feedback' && isActualCorrect && <CheckCircle size={20} color="var(--color-success)" style={{ marginLeft: 'auto' }} />}
                                                    {state === 'feedback' && isSelected && !isActualCorrect && qType !== 'ordering' && <XCircle size={20} color="var(--color-error)" style={{ marginLeft: 'auto' }} />}
                                                    {state === 'feedback' && qType === 'ordering' && (() => {
                                                        const userPos = selectedLetters.indexOf(opt.letter);
                                                        const correctPos = correctArr.indexOf(opt.letter.toUpperCase());
                                                        if (userPos !== -1 && userPos !== correctPos) return <XCircle size={20} color="var(--color-error)" style={{ marginLeft: 'auto' }} />;
                                                        return null;
                                                    })()}
                                                </button>
                                            );
                                        })}
                                    </div>}
                                    {/* Ordering: show the correct sequence plainly when in feedback so user can learn */}
                                    {state === 'feedback' && qType === 'ordering' && (
                                        <div className="ordering-correct-sequence glass-panel" style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
                                            <div style={{ color: 'var(--color-success)', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '0.08em' }}>CORRECT SEQUENCE</div>
                                            {(currentQuestion.correct_answer || '').split(',').map((letter, idx) => {
                                                const matchOpt = options.find(o => o.letter === letter.trim().toUpperCase());
                                                return (
                                                    <div key={letter} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem', opacity: 0.9 }}>
                                                        <span style={{ color: 'var(--color-success)', minWidth: '1.2rem', fontWeight: 700 }}>{idx + 1}.</span>
                                                        <span>{matchOpt?.text || letter}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {state === 'feedback' && (
                                    <div className="quiz-feedback-side">
                                        <div className={`feedback-card glass-panel ${isCorrect ? 'is-correct' : 'is-incorrect'}`}>
                                            <div className="feedback-header">
                                                <Info size={16} />
                                                <span>NEURAL DEBRIEF</span>
                                            </div>
                                            <div className="feedback-content">
                                                <p className="explanation" style={{ fontWeight: 700, color: isCorrect ? 'var(--color-success)' : 'var(--color-error)' }}>
                                                    {isCorrect ? 'Correct' : 'Incorrect'}
                                                </p>
                                                <p className="explanation">
                                                    Correct answer: {correctAnswerText}
                                                </p>
                                                <p style={{ fontSize: '0.82rem', lineHeight: 1.55, opacity: 0.8 }}>
                                                    Difficulty {difficultyAdjustment}. Topic focus {topicFocus}.
                                                </p>
                                                {showExplanations && currentQuestion.explanation && (
                                                    <p className="explanation">
                                                        {currentQuestion.explanation}
                                                    </p>
                                                )}
                                                {showExplanations && currentQuestion.remediation_notes && (
                                                    <div className="remediation-block" style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                                                        <div style={{ color: 'var(--color-warning)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
                                                            HOW TO LOCK THIS IN
                                                        </div>
                                                        <p style={{ fontSize: '0.82rem', lineHeight: 1.55, opacity: 0.85 }}>
                                                            {currentQuestion.remediation_notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <footer className="quiz-action-bar glass-panel">
                    <div className="action-bar-content">
                        <div className="action-status">
                            <div className="hud-label">NEURAL STATUS</div>
                            <div className="status-text">
                                {state === 'active' ? (
                                    (selectedLetters.length > 0 || selectedLetter) ? 'TRANSMISSION READY' : 'WAITING FOR INPUT...'
                                ) : (
                                    isCorrect ? 'SYNCHRONIZATION SUCCESSFUL' : 'WAVEFORM MISMATCH'
                                )}
                            </div>
                        </div>

                        <div className="action-buttons">
                            {state === 'active' ? (
                                <>
                                    <button className="btn-skip" onClick={() => submitAnswer('SKIP')}>
                                        SKIP
                                    </button>
                                    <button
                                        className={`btn-submit ${(selectedLetters.length > 0 || selectedLetter) ? 'ready' : ''}`}
                                        disabled={selectedLetters.length === 0 && !selectedLetter}
                                        onClick={finalizeAnswer}
                                    >
                                        SUBMIT ANSWER
                                    </button>
                                </>
                            ) : (
                                <button className="btn-submit ready" onClick={nextQuestion}>
                                    NEXT QUESTION <ArrowRight size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
