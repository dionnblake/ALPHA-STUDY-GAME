// src/screens/FlashcardsScreen.tsx
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Rotate3d, CheckCircle, RefreshCcw, Radio } from 'lucide-react';
import aiConceptsFlashcards from '../data/ai-concepts-flashcards.json';
import './FlashcardsScreen.css';

interface Flashcard {
    id: number;
    term: string;
    definition: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: string;
}

export function FlashcardsScreen() {
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

    const currentIndexRef = useRef(0);
    const flashcardsRef = useRef<Flashcard[]>([]);

    // Keep refs in sync with state
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        flashcardsRef.current = flashcards;
    }, [flashcards]);


    // Fisher-Yates shuffle algorithm for proper randomization
    const fisherYatesShuffle = (array: Flashcard[]): Flashcard[] => {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    };

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleShuffle = () => {
        const shuffled = fisherYatesShuffle(flashcards);
        setFlashcards(shuffled);
        setCurrentIndex(0);
    };

    useEffect(() => {
        function loadFlashcards() {
            setLoading(true);
            try {
                let filtered = aiConceptsFlashcards as Flashcard[];

                if (difficultyFilter !== 'all') {
                    filtered = filtered.filter(card => card.difficulty === difficultyFilter);
                }

                // Shuffle using Fisher-Yates (unbiased randomization)
                const shuffled = fisherYatesShuffle(filtered);
                setFlashcards(shuffled);
                setCurrentIndex(0);
            } catch (error) {
                console.error("Failed to load flashcards", error);
            } finally {
                setLoading(false);
            }
        }
        loadFlashcards();
    }, [difficultyFilter]);

    // Keyboard navigation - attached to window for better reliability
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                return;
            }

            if (e.key === 'ArrowRight') {
                if (currentIndexRef.current < flashcardsRef.current.length - 1) {
                    e.preventDefault();
                    setCurrentIndex(currentIndexRef.current + 1);
                }
            } else if (e.key === 'ArrowLeft') {
                if (currentIndexRef.current > 0) {
                    e.preventDefault();
                    setCurrentIndex(currentIndexRef.current - 1);
                }
            } else if (e.key === ' ' || e.key === 'Space' || e.key === 'Spacebar' || e.code === 'Space') {
                e.preventDefault();
                setIsFlipped(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (loading) return <div className="page-container flex-center"><h3>Syncing Neural Deck...</h3></div>;
    if (flashcards.length === 0) return (
        <div className="page-container flex-center">
            <h3 style={{ marginBottom: '2rem' }}>No flashcards available.</h3>
            <button className="btn-primary" onClick={() => setDifficultyFilter('all')}>RESET FILTER</button>
        </div>
    );

    const currentCard = flashcards[currentIndex];
    const difficultyColor = currentCard.difficulty === 'beginner' ? '#57F287' : currentCard.difficulty === 'intermediate' ? '#FFA63D' : '#FF5CB8';

    return (
        <div className="page-container flashcards-screen">
            <header className="flashcards-header">
                <div className="deck-meta">
                    <span className="hud-label" style={{ color: 'var(--primary)' }}>SYSTEM: AI CONCEPTS DECK</span>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>AI & ML Definitions</h1>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', justifyContent: 'center' }}>
                {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((difficulty) => (
                    <button
                        key={difficulty}
                        onClick={() => setDifficultyFilter(difficulty)}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '10px',
                            border: `2px solid ${difficultyFilter === difficulty ? 'var(--cyan)' : 'var(--border)'}`,
                            background: difficultyFilter === difficulty ? 'rgba(40, 215, 255, 0.1)' : 'rgba(255,255,255,0.04)',
                            color: difficultyFilter === difficulty ? 'var(--cyan)' : 'var(--text-2)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            transition: 'all 180ms ease',
                        }}
                    >
                        {difficulty === 'all' ? 'All' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </button>
                ))}
            </div>

            <div className="neural-card-display">
                <div className={`holographic-card ${isFlipped ? 'is-flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                    <div className="card-face card-front">
                        <div className="card-domain-slug" style={{ color: difficultyColor }}>
                            <Radio size={12} color={difficultyColor} />
                            {currentCard.difficulty.toUpperCase()} · {currentCard.category.toUpperCase()}
                        </div>
                        <div className="card-prompt" style={{ fontSize: '1.8rem', fontWeight: 700 }}>
                            {currentCard.term}
                        </div>
                        <div className="hud-label-small" style={{ marginTop: 'auto', textAlign: 'center', width: '100%' }}>
                            <Rotate3d size={12} style={{ marginRight: '6px' }} />
                            TAP OR PRESS SPACE TO REVEAL DEFINITION
                        </div>
                    </div>

                    <div className="card-face card-inner-back">
                        <div className="card-domain-slug" style={{ color: difficultyColor }}>
                            <CheckCircle size={12} color={difficultyColor} />
                            DEFINITION
                        </div>
                        <div className="card-resolution">
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-1)', lineHeight: 1.6 }}>{currentCard.definition}</p>
                        </div>
                        <div className="hud-label-small" style={{ marginTop: 'auto', textAlign: 'center', width: '100%' }}>
                            TAP OR PRESS SPACE TO FLIP
                        </div>
                    </div>
                </div>

                <div className="deck-controls">
                    <button className="control-btn" onClick={handleShuffle} title="Shuffle Deck">
                        <RefreshCcw size={20} />
                    </button>
                    <button className="control-btn" onClick={handlePrev} disabled={currentIndex === 0}>
                        <ChevronLeft size={28} />
                    </button>
                    <div className="deck-pos">
                        {currentIndex + 1} <span>/ {flashcards.length}</span>
                    </div>
                    <button className="control-btn" onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
                        <ChevronRight size={28} />
                    </button>
                </div>


            </div>
        </div>
    );
}
