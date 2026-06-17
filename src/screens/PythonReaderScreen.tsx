import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import { PACK_LABELS, pythonReaderMissions, type PythonReaderMission } from "../data/pythonReaderMissions";
import "./PythonReaderScreen.css";

const STORAGE_KEYS = {
  completedIds: "python_reader_completed_ids",
  currentIndex: "python_reader_current_index",
  attempts: "python_reader_attempts",
  correctCount: "python_reader_correct_count"
} as const;

type AttemptLedger = Record<string, { attempts: number; correct: number }>;
type FeedbackState = {
  isCorrect: boolean;
  selectedAnswers: string[];
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function readNumber(key: string, fallback: number) {
  const raw = Number(window.localStorage.getItem(key));
  return Number.isFinite(raw) ? raw : fallback;
}

function normalizeAnswer(answer: string | string[]) {
  return Array.isArray(answer) ? [...answer].sort() : [answer];
}

function sameAnswerSet(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((value, index) => value === sortedRight[index]);
}

function getInitialIndex() {
  const saved = readNumber(STORAGE_KEYS.currentIndex, 0);
  return Math.min(Math.max(saved, 0), pythonReaderMissions.length - 1);
}

export function PythonReaderScreen() {
  const [currentIndex, setCurrentIndex] = useState(getInitialIndex);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>(() => readJson<string[]>(STORAGE_KEYS.completedIds, []));
  const [attempts, setAttempts] = useState<AttemptLedger>(() => readJson<AttemptLedger>(STORAGE_KEYS.attempts, {}));
  const [correctCount, setCorrectCount] = useState(() => readNumber(STORAGE_KEYS.correctCount, 0));

  const mission = pythonReaderMissions[currentIndex];
  const correctAnswers = normalizeAnswer(mission.correctAnswer);
  const isMultiSelect = Array.isArray(mission.correctAnswer);

  const stats = useMemo(() => {
    const completed = new Set(completedIds);
    const packCounts = pythonReaderMissions.reduce<Record<string, { total: number; done: number }>>((acc, item) => {
      acc[item.pack] ??= { total: 0, done: 0 };
      acc[item.pack].total += 1;
      if (completed.has(item.id)) acc[item.pack].done += 1;
      return acc;
    }, {});
    const totalAttempts = Object.values(attempts).reduce((sum, item) => sum + item.attempts, 0);
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

    return {
      completedTotal: completed.size,
      packCounts,
      totalAttempts,
      accuracy
    };
  }, [attempts, completedIds, correctCount]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.currentIndex, String(currentIndex));
  }, [currentIndex]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.completedIds, JSON.stringify(completedIds));
  }, [completedIds]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.attempts, JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.correctCount, String(correctCount));
  }, [correctCount]);

  const goToMission = (nextIndex: number) => {
    const safeIndex = Math.min(Math.max(nextIndex, 0), pythonReaderMissions.length - 1);
    setCurrentIndex(safeIndex);
    setSelectedAnswers([]);
    setFeedback(null);
  };

  const toggleAnswer = (option: string) => {
    if (feedback) return;

    setSelectedAnswers((prev) => {
      if (!isMultiSelect) return [option];
      return prev.includes(option)
        ? prev.filter((answer) => answer !== option)
        : [...prev, option];
    });
  };

  const evaluate = () => {
    if (selectedAnswers.length === 0 || feedback) return;

    const isCorrect = sameAnswerSet(selectedAnswers, correctAnswers);
    setFeedback({ isCorrect, selectedAnswers });
    setAttempts((prev) => {
      const current = prev[mission.id] || { attempts: 0, correct: 0 };
      return {
        ...prev,
        [mission.id]: {
          attempts: current.attempts + 1,
          correct: current.correct + (isCorrect ? 1 : 0)
        }
      };
    });
    if (isCorrect) setCorrectCount((prev) => prev + 1);
    setCompletedIds((prev) => prev.includes(mission.id) ? prev : [...prev, mission.id]);
  };

  const resetProgress = () => {
    setCompletedIds([]);
    setAttempts({});
    setCorrectCount(0);
    setSelectedAnswers([]);
    setFeedback(null);
    goToMission(0);
    window.localStorage.removeItem(STORAGE_KEYS.completedIds);
    window.localStorage.removeItem(STORAGE_KEYS.currentIndex);
    window.localStorage.removeItem(STORAGE_KEYS.attempts);
    window.localStorage.removeItem(STORAGE_KEYS.correctCount);
  };

  return (
    <div className="python-reader-root">
      <header className="python-reader-header">
        <div>
          <span className="python-reader-kicker">PYTHON READER // CODETRACE</span>
          <h1>Review Before Run</h1>
          <p>Read AI-generated Python before you trust it.</p>
        </div>
        <div className="reader-scoreboard" aria-label="Python Reader progress">
          <div>
            <strong>{stats.completedTotal}/{pythonReaderMissions.length}</strong>
            <span>cleared</span>
          </div>
          <div>
            <strong>{stats.accuracy}%</strong>
            <span>accuracy</span>
          </div>
          <div>
            <strong>{stats.totalAttempts}</strong>
            <span>attempts</span>
          </div>
        </div>
      </header>

      <section className="reader-pack-rail" aria-label="Mission packs">
        {(Object.keys(PACK_LABELS) as Array<keyof typeof PACK_LABELS>).map((pack) => {
          const packStats = stats.packCounts[pack] || { total: 0, done: 0 };
          return (
            <button
              key={pack}
              className={`pack-chip ${mission.pack === pack ? "active" : ""}`}
              onClick={() => goToMission(pythonReaderMissions.findIndex((item) => item.pack === pack))}
            >
              <span>{PACK_LABELS[pack]}</span>
              <strong>{packStats.done}/{packStats.total}</strong>
            </button>
          );
        })}
      </section>

      <main className="reader-workspace">
        <section className="reader-code-panel" aria-label="Python code snippet">
          <MissionMeta mission={mission} currentIndex={currentIndex} />
          <pre className="code-window">
            {mission.code.split("\n").map((line, index) => (
              <code key={`${mission.id}-${index}`}>
                <span className="line-number">{index + 1}</span>
                <span className="line-code">{line || " "}</span>
              </code>
            ))}
          </pre>

          <div className="reader-insight-zone">
            {feedback ? (
              <FeedbackPanel mission={mission} feedback={feedback} correctAnswers={correctAnswers} />
            ) : (
              <div className="reader-placeholder">
                <span>Explanation will appear here after you evaluate.</span>
                <p>Use the top of the screen for reading and answers, then drop the debrief here.</p>
              </div>
            )}
          </div>
        </section>

        <section className="reader-challenge-panel" aria-label="Review challenge">
          <div className="challenge-copy">
            <span className="challenge-objective">{mission.objective}</span>
            <h2>{mission.title}</h2>
            <p>{mission.prompt}</p>
            {isMultiSelect && <span className="select-mode">SELECT ALL THAT APPLY</span>}
          </div>

          <div className="answer-grid">
            {mission.options.map((option) => {
              const selected = selectedAnswers.includes(option);
              const isCorrectOption = correctAnswers.includes(option);
              const revealClass = feedback
                ? isCorrectOption
                  ? "correct"
                  : selected
                    ? "incorrect"
                    : ""
                : "";

              return (
                <button
                  key={option}
                  className={`answer-card ${selected ? "selected" : ""} ${revealClass}`}
                  onClick={() => toggleAnswer(option)}
                  aria-pressed={selected}
                >
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          <div className="reader-controls">
            <button className="reader-icon-button" onClick={() => goToMission(currentIndex - 1)} disabled={currentIndex === 0} title="Previous mission">
              <ChevronLeft size={18} />
            </button>
            <button className="reader-evaluate-button" onClick={evaluate} disabled={selectedAnswers.length === 0 || !!feedback}>
              <ShieldCheck size={18} />
              Evaluate
            </button>
            <button className="reader-icon-button" onClick={() => goToMission(currentIndex + 1)} disabled={currentIndex === pythonReaderMissions.length - 1} title="Next mission">
              <ChevronRight size={18} />
            </button>
            <button className="reader-reset-button" onClick={resetProgress} title="Reset Python Reader progress">
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function MissionMeta({ mission, currentIndex }: { mission: PythonReaderMission; currentIndex: number }) {
  return (
    <div className="mission-meta">
      <div>
        <span>{PACK_LABELS[mission.pack]}</span>
        <strong>Mission {currentIndex + 1} / {pythonReaderMissions.length}</strong>
      </div>
      <div className="mission-badges">
        <span>LVL {mission.level}</span>
        <span>{mission.type.replace(/_/g, " ")}</span>
      </div>
    </div>
  );
}

function FeedbackPanel({ mission, feedback, correctAnswers }: { mission: PythonReaderMission; feedback: FeedbackState; correctAnswers: string[] }) {
  return (
    <aside className={`feedback-panel ${feedback.isCorrect ? "success" : "failure"}`}>
      <div className="feedback-status">
        {feedback.isCorrect ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
        <strong>{feedback.isCorrect ? "Correct read" : "Review miss"}</strong>
      </div>
      <div className="correct-answer-box">
        <AlertTriangle size={16} />
        <span>
          {feedback.isCorrect ? "Correct answer matched." : `Correct: ${correctAnswers.join(", ")}`}
        </span>
      </div>
      <p>{mission.explanation}</p>
      <div className="reviewer-note">
        <span>Reviewer note</span>
        <p>{mission.reviewerNote}</p>
      </div>
      {mission.aiPromptToAsk && (
        <div className="ai-prompt-box">
          <span>Ask AI next</span>
          <p>{mission.aiPromptToAsk}</p>
        </div>
      )}
    </aside>
  );
}
