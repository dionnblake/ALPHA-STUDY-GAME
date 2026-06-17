import { useEffect, useMemo, useState } from "react";
import {
  learningPythonMissions,
  getMissionsForWorld,
  WORLD_CONFIG,
  WORLDS,
  type LearningPythonMission,
  type LearningWorldId
} from "../data/learningPythonMissions";
import "./LearningPythonScreen.css";

// === STORAGE KEYS ===
const SK = {
  worldProgress: "learnpy_world_progress", // Record<string, {completedMissions: number[], livesLeft: number}>
  totalXP: "learnpy_total_xp",
  combo: "learnpy_combo",
  unlockedWorlds: "learnpy_unlocked_worlds",
  completedWorlds: "learnpy_completed_worlds"
} as const;

type WorldProgress = {
  completedMissions: number[];
  livesLeft: number;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch { return fallback; }
}

const PIXEL_LINES: Record<string, string[]> = {
  idle: ["Beep boop — ready to read some Python?", "Pixel online. Code detected.", "Show me the code, human!"],
  correct: ["NICE READ!", "BOOM! You got it!", "RADICAL!", "LEGENDARY read!", "You're on fire!", "Another one bites the dust!"],
  wrong: ["WHOOPS — trace it again!", "Not quite — check your steps!", "Almost! One more try.", "Don't rush — read line by line!", "Bug spotted! Try again."],
  bossDefeat: ["YOU DEFEATED THE BUG KING!", "BOSS SLAIN! PIXEL APPROVES!", "AMAZING — you crushed the gauntlet!"],
  bossFail: ["The Bug King is too strong... yet.", "You'll get it next time, I believe!"],
  levelUp: ["LEVEL UP! You're becoming a code reader!", "POWER INCREASED! Next world unlocked!"]
};

function randomLine(category: string): string {
  const lines = PIXEL_LINES[category] || PIXEL_LINES.idle;
  return lines[Math.floor(Math.random() * lines.length)];
}

function getComboLabel(combo: number): string {
  if (combo >= 10) return "SUPERHUMAN";
  if (combo >= 7) return "UNSTOPPABLE";
  if (combo >= 5) return "ON FIRE";
  if (combo >= 3) return "STREAKING";
  if (combo >= 1) return "NICE";
  return "";
}

export function LearningPythonScreen() {
  // === NAVIGATION STATE ===
  const [screen, setScreen] = useState<"world_map" | "mission" | "boss_fight" | "world_complete" | "game_complete">("world_map");
  const [activeWorld, setActiveWorld] = useState<LearningWorldId>(WORLDS[0]);
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);

  // === GAME STATE ===
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswer: string; explanation: string; characterLine: string } | null>(null);
  const [showCharacter] = useState(true);
  const [characterText, setCharacterText] = useState(randomLine("idle"));
  const [bossPhase, setBossPhase] = useState(0);
  const [bossCorrectCount, setBossCorrectCount] = useState(0);
  const [bossDone, setBossDone] = useState(false);
  const [worldCleared, setWorldCleared] = useState(false); // tracked synchronously — not reliant on async state

  // === PERSISTED STATE ===
  const [worldProgress, setWorldProgress] = useState<Record<string, WorldProgress>>(() =>
    readJson(SK.worldProgress, {}));
  const [totalXP, setTotalXP] = useState(() => readJson<number>(SK.totalXP, 0));
  const [combo, setCombo] = useState(() => readJson<number>(SK.combo, 0));
  const [unlockedWorlds, setUnlockedWorlds] = useState<LearningWorldId[]>(() =>
    readJson<LearningWorldId[]>(SK.unlockedWorlds, ["world_variables"]));
  const [completedWorlds, setCompletedWorlds] = useState<LearningWorldId[]>(() =>
    readJson<LearningWorldId[]>(SK.completedWorlds, []));

  // === DERIVED ===
  const worldMissions = useMemo(() => getMissionsForWorld(activeWorld).filter(m => !m.isBoss), [activeWorld]);
  const bossMissionsForWorld = useMemo(() => learningPythonMissions.filter(m => m.world === activeWorld && m.isBoss), [activeWorld]);
  const worldBoss = bossMissionsForWorld[0];
  const currentMission = worldMissions[currentMissionIndex];
  const progress = worldProgress[activeWorld] || { completedMissions: [], livesLeft: 3 };
  const allNormalMissionsDone = worldMissions.length > 0 && worldMissions.every(m => progress.completedMissions.includes(m.missionNumber));
  

  // === PERSISTENCE ===
  useEffect(() => { window.localStorage.setItem(SK.worldProgress, JSON.stringify(worldProgress)); }, [worldProgress]);
  useEffect(() => { window.localStorage.setItem(SK.totalXP, String(totalXP)); }, [totalXP]);
  useEffect(() => { window.localStorage.setItem(SK.combo, String(combo)); }, [combo]);
  useEffect(() => { window.localStorage.setItem(SK.unlockedWorlds, JSON.stringify(unlockedWorlds)); }, [unlockedWorlds]);
  useEffect(() => { window.localStorage.setItem(SK.completedWorlds, JSON.stringify(completedWorlds)); }, [completedWorlds]);

  // === CHARACTER TIMER ===
  useEffect(() => {
    if (!showCharacter) return;
    const timer = setInterval(() => {
      setCharacterText(randomLine("idle"));
    }, 15000);
    return () => clearInterval(timer);
  }, [showCharacter]);

  // === AUTO-ADVANCE after world complete ===
  useEffect(() => {
    if (screen !== "world_complete") return;
    const nextWorldIdx = WORLDS.indexOf(activeWorld) + 1;
    const nextWorld = WORLDS[nextWorldIdx];
    if (!nextWorld) return;
    const t = setTimeout(() => enterWorld(nextWorld), 3000);
    return () => clearTimeout(t);
  }, [screen]);

  // === HELPERS ===
  const updateProgress = (mission: LearningPythonMission, wasCorrect: boolean, isBoss: boolean) => {
    setWorldProgress(prev => {
      const current = prev[activeWorld] || { completedMissions: [], livesLeft: 3 };
      const newLives = wasCorrect ? current.livesLeft : Math.max(0, current.livesLeft - 1);
      const alreadyCompleted = current.completedMissions.includes(mission.missionNumber);
      const newCompleted = wasCorrect && !isBoss && !alreadyCompleted
        ? [...current.completedMissions, mission.missionNumber]
        : current.completedMissions;
      return { ...prev, [activeWorld]: { completedMissions: newCompleted, livesLeft: newLives } };
    });

    const current = worldProgress[activeWorld] || { completedMissions: [], livesLeft: 3 };
    const alreadyCompleted = !isBoss && current.completedMissions.includes(mission.missionNumber);
    const shouldAwardXp = wasCorrect && (isBoss || !alreadyCompleted);

    if (shouldAwardXp) {
      const xpGain = 10 + (isBoss ? 25 : 0) + Math.min(combo * 2, 20);
      setTotalXP(prev => prev + xpGain);
      setCombo(prev => prev + 1);
    } else if (!wasCorrect) {
      setCombo(0);
    }
  };

  const enterWorld = (world: LearningWorldId) => {
    if (!unlockedWorlds.includes(world) || completedWorlds.includes(world)) return;
    const missions = getMissionsForWorld(world).filter(m => !m.isBoss);
    const savedProgress = worldProgress[world] || { completedMissions: [], livesLeft: 3 };
    const healedProgress = savedProgress.livesLeft > 0 ? savedProgress : { ...savedProgress, livesLeft: 3 };
    const firstIncompleteIndex = missions.findIndex(m => !healedProgress.completedMissions.includes(m.missionNumber));
    const allDone = missions.length > 0 && firstIncompleteIndex === -1;

    setActiveWorld(world);
    setCurrentMissionIndex(allDone ? Math.max(0, missions.length - 1) : Math.max(0, firstIncompleteIndex));
    setSelectedAnswers([]);
    setFeedback(null);
    setBossPhase(0);
    setBossCorrectCount(0);
    setBossDone(false);
    setCharacterText(`Entering ${WORLD_CONFIG[world].name}...`);
    setWorldCleared(allDone);
    // Heal stale saved progress from earlier buggy versions only when entering a world.
    setWorldProgress(prev => {
      const current = prev[world] || { completedMissions: [], livesLeft: 3 };
      if (current.livesLeft > 0) return prev;
      return { ...prev, [world]: { ...current, livesLeft: 3 } };
    });
    setScreen(missions.length > 0 ? "mission" : "world_map");
  };

  const goToWorldMap = () => {
    setScreen("world_map");
    setSelectedAnswers([]);
    setFeedback(null);
    setBossPhase(0);
    setWorldCleared(false);
    setCharacterText(randomLine("idle"));
  };

  const toggleAnswer = (index: number) => {
    if (feedback) return;
    setSelectedAnswers(prev => prev.includes(index) ? prev.filter(i => i !== index) : [index]);
  };

  const evaluate = () => {
    if (selectedAnswers.length === 0 || feedback) return;
    if (screen === "boss_fight") return; // handled by bossEvaluate

    const isCorrect = selectedAnswers[0] === currentMission.options.indexOf(currentMission.correctAnswer);
    const cat_ = isCorrect ? "correct" : "wrong";
    setCharacterText(currentMission.characterLine || randomLine(cat_));
    setFeedback({
      isCorrect,
      correctAnswer: currentMission.correctAnswer,
      explanation: currentMission.explanation,
      characterLine: currentMission.characterLine
    });
    updateProgress(currentMission, isCorrect, false);

    // Check if world is done after this
    const nextLives = isCorrect ? progress.livesLeft : Math.max(0, progress.livesLeft - 1);
    const newProgress = { ...worldProgress, [activeWorld]: {
      ...progress,
      completedMissions: isCorrect ? [...new Set([...progress.completedMissions, currentMission.missionNumber])] : progress.completedMissions,
      livesLeft: nextLives
    }};
    const newCompleted = newProgress[activeWorld].completedMissions;
    const allDone = worldMissions.every(m => newCompleted.includes(m.missionNumber));

    if (allDone) {
      setWorldCleared(true);
    }
  };

  const nextMission = () => {
    if (currentMissionIndex < worldMissions.length - 1) {
      setCurrentMissionIndex(prev => prev + 1);
    }
    setSelectedAnswers([]);
    setFeedback(null);
  };

  const startBossFight = () => {
    setScreen("boss_fight");
    setBossPhase(0);
    setBossCorrectCount(0);
    setBossDone(false);
    setSelectedAnswers([]);
    setFeedback(null);
    setCharacterText("BOSS FIGHT! The Bug King appears!");
  };

  const evaluateBoss = () => {
    if (!worldBoss || selectedAnswers.length === 0 || feedback) return;
    const bossMissions = bossMissionsForWorld;
    const phaseMission = bossMissions[bossPhase];
    if (!phaseMission) return;

    const isCorrect = selectedAnswers[0] === phaseMission.options.indexOf(phaseMission.correctAnswer);
    const newBossCorrect = isCorrect ? bossCorrectCount + 1 : bossCorrectCount;
    setCharacterText(isCorrect ? randomLine("correct") : randomLine("wrong"));

    setFeedback({
      isCorrect,
      correctAnswer: phaseMission.correctAnswer,
      explanation: phaseMission.explanation,
      characterLine: phaseMission.characterLine
    });
    updateProgress(phaseMission, isCorrect, true);

    if (bossPhase < bossMissions.length - 1) {
      // Next boss phase after viewing feedback
      setTimeout(() => {
        setBossPhase(prev => prev + 1);
        setSelectedAnswers([]);
        setFeedback(null);
        setBossCorrectCount(newBossCorrect);
      }, 2000);
    } else {
      // Boss fight over
      setBossCorrectCount(newBossCorrect);
      setBossDone(true);
      const bossWon = newBossCorrect >= Math.ceil(bossMissions.length / 2);

      if (bossWon) {
        setCharacterText(randomLine("bossDefeat"));
        setCompletedWorlds(prev => prev.includes(activeWorld) ? prev : [...prev, activeWorld]);
        // Unlock next world
        const currentIndex = WORLDS.indexOf(activeWorld);
        if (currentIndex < WORLDS.length - 1 && !unlockedWorlds.includes(WORLDS[currentIndex + 1])) {
          setUnlockedWorlds(prev => [...prev, WORLDS[currentIndex + 1]]);
        }
        setTotalXP(prev => prev + 50);
        setTimeout(() => {
          if (activeWorld === WORLDS[WORLDS.length - 1]) {
            setScreen("game_complete");
          } else {
            setScreen("world_complete");
          }
        }, 2000);
      } else {
        setCharacterText(randomLine("bossFail"));
        setTimeout(() => goToWorldMap(), 2000);
      }
    }
  };

  const resetAll = () => {
    setWorldProgress({});
    setTotalXP(0);
    setCombo(0);
    setUnlockedWorlds(["world_variables"]);
    setCompletedWorlds([]);
    setScreen("world_map");
    setSelectedAnswers([]);
    setFeedback(null);
    for (const key of Object.values(SK)) window.localStorage.removeItem(key);
  };

  const comboLabel = getComboLabel(combo);
  const livesLeft = progress.livesLeft;

  // === RENDER: WORLD MAP ===
  if (screen === "world_map") {
    return (
      <div className="learnpy-root">
        <div className="learnpy-header">
          <div>
            <span className="learnpy-kicker">LEARNING PYTHON // CODE READER</span>
            <h1>World Map</h1>
            <p>Master each world to unlock the next. Clear 15 missions per world + the BOSS GAUNTLET!</p>
          </div>
          <div className="learnpy-top-right">
            <div className="learnpy-xp-display">
              <span className="learnpy-xp-label">XP</span>
              <span className="learnpy-xp-value">{totalXP}</span>
            </div>
            {combo > 0 && (
              <div className="learnpy-combo-badge">{comboLabel} {combo}x</div>
            )}
            <button className="learnpy-reset-btn" onClick={resetAll} title="Reset all progress">⟳</button>
          </div>
        </div>

        {/* PIXEL Character */}
        <div className="learnpy-pixel-area" onClick={() => setCharacterText(randomLine("idle"))}>
          <div className="learnpy-pixel-avatar">
            <svg viewBox="0 0 32 32" width="48" height="48" fill="none">
              <rect x="8" y="4" width="16" height="6" rx="1" fill="#1cd4ff" opacity="0.8"/>
              <rect x="6" y="10" width="20" height="14" rx="2" fill="#1cd4ff"/>
              <rect x="10" y="14" width="4" height="4" rx="1" fill="#0a1628"/>
              <rect x="18" y="14" width="4" height="4" rx="1" fill="#0a1628"/>
              <rect x="14" y="19" width="4" height="2" rx="1" fill="#0a1628"/>
              <rect x="12" y="24" width="8" height="2" rx="1" fill="#1cd4ff" opacity="0.6"/>
              <rect x="10" y="26" width="12" height="2" rx="1" fill="#1cd4ff" opacity="0.4"/>
            </svg>
          </div>
          <div className="learnpy-pixel-bubble">
            <p>{characterText}</p>
          </div>
        </div>

        {/* World Map */}
        <div className="learnpy-world-map">
          {WORLDS.map((worldId, idx) => {
            const config = WORLD_CONFIG[worldId];
            const unlocked = unlockedWorlds.includes(worldId);
            const completed = completedWorlds.includes(worldId);
            const locked = !unlocked;
            const wProgress = worldProgress[worldId] || { completedMissions: [], livesLeft: 3 };
            const wMissions = getMissionsForWorld(worldId).filter(m => !m.isBoss);
            const doneCount = wMissions.filter(m => wProgress.completedMissions.includes(m.missionNumber)).length;
            const totalCount = Math.max(1, wMissions.length);

            return (
              <div
                key={worldId}
                className={`learnpy-world-node ${locked ? "locked" : ""} ${completed ? "completed" : ""} ${activeWorld === worldId ? "active" : ""}`}
                onClick={() => unlocked && !completed && enterWorld(worldId)}
                style={{ '--world-color': config.color } as React.CSSProperties}
              >
                <div className="learnpy-world-icon">{config.icon}</div>
                <div className="learnpy-world-info">
                  <span className="learnpy-world-name">{config.name}</span>
                  <span className="learnpy-world-desc">{config.description}</span>
                  {completed && <span className="learnpy-world-status-complete">✓ COMPLETE</span>}
                  {!completed && unlocked && (
                    <div className="learnpy-world-progress-bar">
                      <div className="learnpy-world-progress-fill" style={{ width: `${(doneCount / totalCount) * 100}%` }} />
                    </div>
                  )}
                  {locked && <span className="learnpy-world-status-locked">🔒 Locked</span>}
                </div>
                {idx < WORLDS.length - 1 && <div className="learnpy-world-connector" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // === RENDER: MISSION ===
  if (screen === "mission" && currentMission) {
    const isCorrectSelected = feedback ? feedback.isCorrect : false;
    const bossReady = (worldCleared || allNormalMissionsDone) && Boolean(worldBoss); // lives don't gate boss — all missions done unlocks it

    return (
      <div className="learnpy-root learnpy-mission-mode">
        {/* Top bar */}
        <div className="learnpy-mission-topbar">
          <button className="learnpy-back-btn" onClick={goToWorldMap}>← Map</button>
          <div className="learnpy-world-indicator" style={{ '--world-color': WORLD_CONFIG[activeWorld].color } as React.CSSProperties}>
            {WORLD_CONFIG[activeWorld].icon} {WORLD_CONFIG[activeWorld].name}
          </div>
          <div className="learnpy-mission-stats">
            <div className="learnpy-lives-display">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={`learnpy-heart ${i < livesLeft ? "alive" : "dead"}`}>♥</span>
              ))}
            </div>
            <div className="learnpy-mission-counter">M {currentMission.missionNumber}/{worldMissions.length}</div>
            <div className="learnpy-xp-display">
              <span className="learnpy-xp-label">XP</span>
              <span className="learnpy-xp-value">{totalXP}</span>
            </div>
            {combo > 0 && <div className="learnpy-combo-badge">{comboLabel} {combo}x</div>}
          </div>
        </div>

        {/* Main game area */}
        <div className="learnpy-game-area">
          {/* Code panel */}
          <div className="learnpy-code-panel">
            <div className="learnpy-code-header">
              <span>Python</span>
              <span className="learnpy-code-prompt">{currentMission.question}</span>
            </div>
            <pre className="learnpy-code-block">
              {currentMission.code.split("\n").map((line, i) => (
                <code key={i}>
                  <span className="learnpy-line-num">{i + 1}</span>
                  <span className="learnpy-line-code">{line || " "}</span>
                </code>
              ))}
            </pre>
          </div>

          {/* Character + options */}
          <div className="learnpy-options-area">
            <div className="learnpy-pixel-area">
              <div className="learnpy-pixel-avatar">
                <svg viewBox="0 0 32 32" width="42" height="42" fill="none">
                  <rect x="8" y="4" width="16" height="6" rx="1" fill={isCorrectSelected ? "#48f57e" : feedback && !isCorrectSelected ? "#ff4444" : "#1cd4ff"} opacity="0.8"/>
                  <rect x="6" y="10" width="20" height="14" rx="2" fill={isCorrectSelected ? "#48f57e" : feedback && !isCorrectSelected ? "#ff4444" : "#1cd4ff"}/>
                  <rect x="10" y="14" width="4" height="4" rx="1" fill="#0a1628"/>
                  <rect x="18" y="14" width="4" height="4" rx="1" fill="#0a1628"/>
                  <rect x="14" y="19" width="4" height="2" rx="1" fill="#0a1628"/>
                  <rect x="12" y="24" width="8" height="2" rx="1" fill="#1cd4ff" opacity="0.6"/>
                </svg>
              </div>
              <div className="learnpy-pixel-bubble">
                <p>{characterText}</p>
              </div>
            </div>

            <div className="learnpy-answer-grid">
              {currentMission.options.map((opt, i) => {
                const selected = selectedAnswers.includes(i);
                const isCorrectOpt = i === currentMission.options.indexOf(currentMission.correctAnswer);
                let cardClass = "";
                if (feedback) {
                  if (isCorrectOpt) cardClass = "correct";
                  else if (selected) cardClass = "incorrect";
                } else if (selected) {
                  cardClass = "selected";
                }
                return (
                  <button key={i} className={`learnpy-answer-card ${cardClass}`} onClick={() => toggleAnswer(i)}>
                    <span className="learnpy-answer-letter">{String.fromCharCode(65 + i)}</span>
                    <span className="learnpy-answer-text">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Controls */}
            <div className="learnpy-controls">
              {!feedback && (
                <button className="learnpy-evaluate-btn" onClick={evaluate} disabled={selectedAnswers.length === 0}>
                  Evaluate
                </button>
              )}
              {feedback && feedback.isCorrect && currentMissionIndex < worldMissions.length - 1 && (
                <button className="learnpy-next-btn" onClick={nextMission}>
                  Next Mission →
                </button>
              )}
              {feedback && !feedback.isCorrect && livesLeft > 0 && (
                <button className="learnpy-next-btn" onClick={() => { setSelectedAnswers([]); setFeedback(null); }}>
                  Try Again →
                </button>
              )}
              {feedback && currentMissionIndex === worldMissions.length - 1 && bossReady && (
                <button className="learnpy-boss-btn" onClick={startBossFight}>
                  ⚔️ Fight Boss!
                </button>
              )}
              {feedback && !bossReady && currentMissionIndex === worldMissions.length - 1 && (
                <button className="learnpy-map-btn" onClick={goToWorldMap}>
                  ← Back to Map
                </button>
              )}
              {feedback && livesLeft === 0 && (
                <>
                  <div className="learnpy-game-over">No lives left! World reset. Heal up on the map.</div>
                  <button className="learnpy-map-btn" onClick={() => {
                    setWorldProgress(prev => ({ ...prev, [activeWorld]: { completedMissions: [], livesLeft: 3 } }));
                    goToWorldMap();
                  }}>
                    Reset World → Map
                  </button>
                </>
              )}
            </div>

            {/* Feedback panel */}
            {feedback && (
              <div className={`learnpy-feedback ${feedback.isCorrect ? "success" : "failure"}`}>
                <div className="learnpy-feedback-header">
                  {feedback.isCorrect ? "✓ CORRECT" : "✗ INCORRECT"}
                </div>
                <div className="learnpy-feedback-correct">
                  Answer: <strong>{feedback.correctAnswer}</strong>
                </div>
                <p className="learnpy-feedback-explanation">{feedback.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === RENDER: BOSS FIGHT ===
  if (screen === "boss_fight" && worldBoss) {
    const bossMissions = bossMissionsForWorld;
    const phaseMission = bossMissions[bossPhase];
    if (!phaseMission) return null;

    return (
      <div className="learnpy-root learnpy-mission-mode learnpy-boss-mode">
        <div className="learnpy-mission-topbar">
          <div className="learnpy-world-indicator" style={{ '--world-color': WORLD_CONFIG[activeWorld].color } as React.CSSProperties}>
            👑 BOSS FIGHT — {WORLD_CONFIG[activeWorld].name}
          </div>
          <div className="learnpy-mission-stats">
            <div className="learnpy-boss-phase">
              Phase {bossPhase + 1}/{bossMissions.length}
            </div>
            <div className="learnpy-boss-score">
              ✓ {bossCorrectCount}
            </div>
            <div className="learnpy-xp-display">
              <span className="learnpy-xp-label">XP</span>
              <span className="learnpy-xp-value">{totalXP}</span>
            </div>
          </div>
        </div>

        <div className="learnpy-boss-banner">
          ⚔️ BOSS: {phaseMission.title} ⚔️
        </div>

        <div className="learnpy-game-area">
          <div className="learnpy-code-panel">
            <div className="learnpy-code-header">
              <span>Python</span>
              <span className="learnpy-code-prompt">{phaseMission.question}</span>
            </div>
            <pre className="learnpy-code-block">
              {phaseMission.code.split("\n").map((line, i) => (
                <code key={i}>
                  <span className="learnpy-line-num">{i + 1}</span>
                  <span className="learnpy-line-code">{line || " "}</span>
                </code>
              ))}
            </pre>
          </div>

          <div className="learnpy-options-area">
            <div className="learnpy-pixel-area">
              <div className="learnpy-pixel-avatar">
                <svg viewBox="0 0 32 32" width="42" height="42" fill="none">
                  <rect x="8" y="4" width="16" height="6" rx="1" fill="#ff4444" opacity="0.8"/>
                  <rect x="6" y="10" width="20" height="14" rx="2" fill="#ff4444"/>
                  <rect x="10" y="14" width="4" height="4" rx="1" fill="#fff"/>
                  <rect x="18" y="14" width="4" height="4" rx="1" fill="#fff"/>
                  <rect x="14" y="19" width="4" height="2" rx="1" fill="#fff"/>
                </svg>
              </div>
              <div className="learnpy-pixel-bubble boss-fight">
                <p>{characterText}</p>
              </div>
            </div>

            <div className="learnpy-answer-grid">
              {phaseMission.options.map((opt, i) => {
                const selected = selectedAnswers.includes(i);
                const isCorrectOpt = i === phaseMission.options.indexOf(phaseMission.correctAnswer);
                let cardClass = "";
                if (feedback) {
                  if (isCorrectOpt) cardClass = "correct";
                  else if (selected) cardClass = "incorrect";
                } else if (selected) cardClass = "selected";
                return (
                  <button key={i} className={`learnpy-answer-card ${cardClass}`} onClick={() => toggleAnswer(i)}>
                    <span className="learnpy-answer-letter">{String.fromCharCode(65 + i)}</span>
                    <span className="learnpy-answer-text">{opt}</span>
                  </button>
                );
              })}
            </div>

            <div className="learnpy-controls">
              {!feedback && !bossDone && (
                <button className="learnpy-evaluate-btn boss" onClick={evaluateBoss} disabled={selectedAnswers.length === 0}>
                  Submit Boss Answer
                </button>
              )}
              {bossDone && bossCorrectCount >= Math.ceil(bossMissions.length / 2) && (
                <button className="learnpy-next-btn" onClick={() => {
                  if (activeWorld === WORLDS[WORLDS.length - 1]) setScreen("game_complete");
                  else setScreen("world_complete");
                }}>
                  Continue →
                </button>
              )}
              {bossDone && bossCorrectCount < Math.ceil(bossMissions.length / 2) && (
                <button className="learnpy-map-btn" onClick={goToWorldMap}>
                  ← Retry Later
                </button>
              )}
            </div>

            {feedback && (
              <div className={`learnpy-feedback ${feedback.isCorrect ? "success" : "failure"}`}>
                <div className="learnpy-feedback-header">
                  {feedback.isCorrect ? "✓ BOSS HIT!" : "✗ BOSS DODGED!"}
                </div>
                <div className="learnpy-feedback-correct">
                  Answer: <strong>{feedback.correctAnswer}</strong>
                </div>
                <p className="learnpy-feedback-explanation">{feedback.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === RENDER: WORLD COMPLETE ===
  if (screen === "world_complete") {
    const nextWorldIdx = WORLDS.indexOf(activeWorld) + 1;
    const nextWorld = WORLDS[nextWorldIdx];

    return (
      <div className="learnpy-root learnpy-complete-screen">
        <div className="learnpy-complete-content">
          <div className="learnpy-complete-icon">🏆</div>
          <h1>World Complete!</h1>
          <p className="learnpy-complete-sub">You defeated {WORLD_CONFIG[activeWorld].name}!</p>
          <div className="learnpy-complete-stats">
            <div className="learnpy-complete-stat">
              <span className="learnpy-complete-stat-label">XP Earned</span>
              <span className="learnpy-complete-stat-value">+50</span>
            </div>
            <div className="learnpy-complete-stat">
              <span className="learnpy-complete-stat-label">Total XP</span>
              <span className="learnpy-complete-stat-value">{totalXP}</span>
            </div>
          </div>
          {nextWorld && (
            <button className="learnpy-next-btn large" onClick={() => enterWorld(nextWorld)}>
              Unlock {WORLD_CONFIG[nextWorld].icon} {WORLD_CONFIG[nextWorld].name} →
            </button>
          )}
          <button className="learnpy-map-btn" onClick={goToWorldMap}>← World Map</button>
        </div>
      </div>
    );
  }

  // === RENDER: GAME COMPLETE ===
  if (screen === "game_complete") {
    return (
      <div className="learnpy-root learnpy-complete-screen">
        <div className="learnpy-complete-content">
          <div className="learnpy-complete-icon game-cleared">👑</div>
          <h1>GAME CLEARED!</h1>
          <p className="learnpy-complete-sub">You can READ Python code like a PRO!</p>
          <div className="learnpy-complete-stats">
            <div className="learnpy-complete-stat">
              <span className="learnpy-complete-stat-label">Total XP</span>
              <span className="learnpy-complete-stat-value">{totalXP}</span>
            </div>
            <div className="learnpy-complete-stat">
              <span className="learnpy-complete-stat-label">Best Combo</span>
              <span className="learnpy-complete-stat-value">{combo}x</span>
            </div>
          </div>
          <p className="learnpy-game-complete-message">
            You now know: variables, types, lists, dicts, control flow, loops, and functions.<br />
            Time to review real codebases like a boss!
          </p>
          <button className="learnpy-reset-btn large" onClick={resetAll}>🔄 Play Again</button>
          <button className="learnpy-map-btn" onClick={goToWorldMap}>← World Map</button>
        </div>
      </div>
    );
  }

  return (
    <div className="learnpy-root learnpy-complete-screen">
      <div className="learnpy-complete-content">
        <div className="learnpy-complete-icon">⚠</div>
        <h1>Mission state repaired</h1>
        <p className="learnpy-complete-sub">PIXEL found an impossible screen state and sent you back to safety.</p>
        <button className="learnpy-map-btn" onClick={goToWorldMap}>← World Map</button>
      </div>
    </div>
  );
}