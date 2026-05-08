// src/screens/SearchScreen.tsx
import { useState, useEffect } from 'react';
import { Search, History, Clock, BookOpen, ChevronRight, X, Cpu, Fingerprint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchQuestions, getSearchHistory, addToHistory, clearHistory, getPopularSearchTerms } from '../services/searchService';
import { Question, SearchHistory } from '../types/models';
import './SearchScreen.css';

export function SearchScreen() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [activeQuery, setActiveQuery] = useState('');
    const [results, setResults] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<SearchHistory[]>([]);
    const [quickTerms, setQuickTerms] = useState<string[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

    useEffect(() => {
        loadHistory();
        loadQuickTerms();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length >= 2) {
                performSearch(query);
            } else {
                setResults([]);
                setActiveQuery('');
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    async function loadHistory() {
        const h = await getSearchHistory();
        setHistory(h);
    }

    async function loadQuickTerms() {
        const terms = await getPopularSearchTerms();
        setQuickTerms(terms);
    }

    async function performSearch(searchTerm: string) {
        try {
            const trimmed = searchTerm.trim();
            if (trimmed.length < 2) {
                setResults([]);
                setActiveQuery('');
                return;
            }

            setLoading(true);
            setActiveQuery(trimmed);
            const res = await searchQuestions(searchTerm);
            setResults(res);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    }

    const commitSearch = async (searchTerm: string) => {
        const trimmed = searchTerm.trim();
        if (trimmed.length < 2) return;
        await addToHistory(trimmed);
        await loadHistory();
        await performSearch(trimmed);
    };

    const handleClearHistory = async () => {
        await clearHistory();
        setHistory([]);
    };

    return (
        <div className="page-container search-screen-root">
            <header className="search-header">
                <span className="hud-label" style={{ color: 'var(--primary)' }}>SYSTEM: DATA SCRAPER ACTIVE</span>
                <div className="tactical-search-bar">
                    <Search className="text-muted" size={24} />
                    <input
                        type="text"
                        placeholder="IDENTIFY DATA PATTERN OR KEYWORD..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                void commitSearch(query);
                            }
                        }}
                        autoFocus
                    />
                    {query && (
                        <button className="control-btn" onClick={() => setQuery('')}>
                            <X size={18} />
                        </button>
                    )}
                </div>
            </header>

            <div className="search-results-grid">
                <main className="results-stream">
                    {query.length < 2 ? (
                        <div className="flex-center" style={{ padding: '6rem 0', opacity: 0.5, flexDirection: 'column', gap: '2rem' }}>
                            <Fingerprint size={80} color="var(--primary)" />
                            <p className="hud-label">AWAITING PATTERN INPUT...</p>
                        </div>
                    ) : (
                        <div>
                            <div className="hud-label-small" style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>
                                {loading
                                    ? 'SCANNING KNOWLEDGE GRAPH...'
                                    : `${results.length} MATCHING CONCEPT NODES IDENTIFIED`}
                            </div>
                            {!loading && results.length === 0 && (
                                <div className="empty-results-hud">
                                    <p>No exact matches found for "{activeQuery}".</p>
                                    <button className="button-secondary" onClick={() => navigate('/quiz?type=mixed')}>
                                        Start Mixed Mission Instead
                                    </button>
                                </div>
                            )}
                            {results.map(q => (
                                <div
                                    key={q.uid}
                                    className="holographic-result-card"
                                    onClick={() => setSelectedQuestion(q)}
                                >
                                    <div className="result-meta">
                                        <span className="result-category">{q.category}</span>
                                        <span className={`result-difficulty ${q.difficulty}`}>{q.difficulty}</span>
                                    </div>
                                    <p className="result-text">{q.question_text}</p>
                                    <div className="result-actions-row">
                                        <div className="hud-label-small" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <BookOpen size={12} />
                                            DECRYPT EXPLANATION
                                            <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
                                        </div>
                                        <button
                                            className="mini-action-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/quiz?type=domain&domainId=${q.domain_id}`);
                                            }}
                                        >
                                            Practice Domain
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                <aside className="hud-sidebar">
                    <div className="hud-sidebar-section">
                        <div className="hud-section-header">
                            <History size={16} />
                            <h4>RECALL HISTORY</h4>
                            {history.length > 0 && <button onClick={handleClearHistory} className="text-btn-hud">PURGE</button>}
                        </div>
                        <div className="history-list">
                            {history.length === 0 ? (
                                <p className="hud-label-small" style={{ padding: '1rem' }}>NO RECENT TRACES</p>
                            ) : (
                                history.map(h => (
                                    <button
                                        key={h.id}
                                        className="history-item-hud"
                                        onClick={() => {
                                            setQuery(h.query);
                                            void commitSearch(h.query);
                                        }}
                                    >
                                        <Clock size={12} style={{ opacity: 0.5 }} />
                                        <span>{h.query.toUpperCase()}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="hud-sidebar-section">
                        <div className="hud-section-header">
                            <Cpu size={16} />
                            <h4>QUICK NODES</h4>
                        </div>
                        <div className="pill-grid">
                            {quickTerms.length === 0 ? (
                                <p className="hud-label-small" style={{ padding: '1rem' }}>NO QUESTION CATEGORIES LOADED</p>
                            ) : (
                                quickTerms.map(tag => (
                                    <button
                                        key={tag}
                                        className="tactical-pill"
                                        onClick={() => {
                                            setQuery(tag);
                                            void commitSearch(tag);
                                        }}
                                    >
                                        {tag.toUpperCase()}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </aside>
            </div>

            {selectedQuestion && (
                <div className="detail-modal-overlay" onClick={() => setSelectedQuestion(null)}>
                    <div className="detail-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setSelectedQuestion(null)}><X /></button>
                        <div className="detail-modal-body">
                            <div>
                                <span className="hud-label" style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'block' }}>
                                    NODE: {selectedQuestion.category?.toUpperCase() || 'GENERAL'}
                                </span>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{selectedQuestion.question_text}</h2>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {[
                                    { key: 'A', val: selectedQuestion.option_a },
                                    { key: 'B', val: selectedQuestion.option_b },
                                    { key: 'C', val: selectedQuestion.option_c },
                                    { key: 'D', val: selectedQuestion.option_d }
                                ].map(opt => (
                                    <div key={opt.key} className={`modal-option-hud ${selectedQuestion.correct_answer === opt.key ? 'is-correct' : ''}`}>
                                        <strong style={{ color: 'var(--primary)', width: '20px' }}>{opt.key}</strong>
                                        {opt.val}
                                    </div>
                                ))}
                            </div>

                            <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)' }}>
                                <h4 className="hud-label" style={{ marginBottom: '1rem' }}>DECRYPTED EXPLANATION</h4>
                                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    {selectedQuestion.explanation}
                                </p>
                                <div style={{ marginTop: '1rem' }}>
                                    <button
                                        className="button-primary"
                                        onClick={() => navigate(`/quiz?type=domain&domainId=${selectedQuestion.domain_id}`)}
                                    >
                                        Launch Domain Mission
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
