// src/screens/SessionSummaryScreen.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getDb } from '../services/database';
import { SessionMetadata, StudySession } from '../types/models';
import { Clock, Award, Star, ArrowLeft, RotateCcw, Target, Share2 } from 'lucide-react';
import { buildChallengeMessage, createChallengeToken, logGrowthEvent } from '../services/growthService';
import './SessionSummaryScreen.css';

export function SessionSummaryScreen() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('sessionId');
    const [session, setSession] = useState<StudySession | null>(null);
    const [metadata, setMetadata] = useState<SessionMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        async function fetchSession() {
            if (!sessionId) {
                setLoading(false);
                return;
            }
            try {
                const db = await getDb();
                const results = await db.select<StudySession[]>(
                    'SELECT * FROM study_sessions WHERE id = ?',
                    [parseInt(sessionId)]
                );
                if (results.length > 0) {
                    setSession(results[0]);
                    if (results[0].session_metadata) {
                        try {
                            setMetadata(JSON.parse(results[0].session_metadata));
                        } catch (error) {
                            console.error('Failed to parse session metadata', error);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch session", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSession();
    }, [sessionId]);

    if (loading) return <div className="page-container flex-center"><h3>Compiling Mission Data...</h3></div>;
    if (!session) return <div className="page-container flex-center"><h3>Mission Data Not Found</h3><button className="btn-primary mt-4" onClick={() => navigate('/')}>RETURN TO BASE</button></div>;
    const sessionData = session;

    const accuracy = sessionData.total_questions > 0
        ? Math.round((sessionData.correct_answers / sessionData.total_questions) * 100)
        : 0;

    const durationSeconds = sessionData.end_timestamp
        ? Math.floor((sessionData.end_timestamp - sessionData.start_timestamp) / 1000)
        : 0;

    const pointsEarned = sessionData.correct_answers * 15;
    const challengeToken = createChallengeToken({
        accuracy,
        pointsEarned,
        totalQuestions: sessionData.total_questions,
        correctAnswers: sessionData.correct_answers
    });

    async function copyChallengeLink() {
        const message = buildChallengeMessage({
            accuracy,
            pointsEarned,
            totalQuestions: sessionData.total_questions,
            correctAnswers: sessionData.correct_answers
        }, challengeToken);

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(message);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = message;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }

            await logGrowthEvent('share_clicked', {
                sessionId: sessionData.id ?? null,
                accuracy,
                pointsEarned
            });
            setShareStatus('success');
        } catch (error) {
            console.error('Failed to copy challenge link', error);
            setShareStatus('error');
        }
    }

    return (
        <div className="page-container summary-screen">
            <div className="debrief-card">
                <div className="debrief-header">
                    <span className="hud-label">COGNITIVE MISSION DEBRIEF</span>
                    <h1>Synchronicity Restored</h1>
                    <p className="text-muted">Session ID: #{sessionId} // Type: {session.session_type?.toUpperCase()}</p>
                    {metadata?.quiz_mode && (
                        <p className="text-muted">Mode: {metadata.quiz_mode.toUpperCase()}</p>
                    )}
                </div>

                <div className="debrief-grid">
                    <div className="debrief-module highlight">
                        <div className="hud-label-small">
                            <Target size={12} style={{ marginRight: '6px' }} />
                            ACCURACY GAUGE
                        </div>
                        <div className="debrief-val">{accuracy}%</div>
                        <div className="text-small">Mission Precision</div>
                    </div>

                    <div className="debrief-module">
                        <div className="hud-label-small">
                            <Star size={12} style={{ marginRight: '6px', color: 'var(--accent)' }} />
                            XP ACCUMULATED
                        </div>
                        <div className="debrief-val">{pointsEarned}</div>
                        <div className="text-small">Neural Expansion</div>
                    </div>

                    <div className="debrief-module">
                        <div className="hud-label-small">
                            <Clock size={12} style={{ marginRight: '6px' }} />
                            TIME ELAPSED
                        </div>
                        <div className="debrief-val">{Math.round(durationSeconds / 60)}m</div>
                        <div className="text-small">Link Duration</div>
                    </div>

                    <div className="debrief-module">
                        <div className="hud-label-small">
                            <Award size={12} style={{ marginRight: '6px', color: 'var(--color-success)' }} />
                            NODES SECURED
                        </div>
                        <div className="debrief-val">{session.correct_answers}/{session.total_questions}</div>
                        <div className="text-small">Validation Check</div>
                    </div>
                </div>

                <div className="debrief-footer">
                    <button className="btn-secondary flex-center gap-2" onClick={() => navigate('/')}>
                        <ArrowLeft size={18} /> COMMAND CENTER
                    </button>
                    <button className="btn-secondary flex-center gap-2" onClick={copyChallengeLink}>
                        <Share2 size={18} /> COPY CHALLENGE LINK
                    </button>
                    <button className="btn-primary flex-center gap-2" onClick={() => navigate('/quiz')}>
                        <RotateCcw size={18} /> RE-INITIALIZE LINK
                    </button>
                </div>
                {(metadata?.weak_areas?.length || metadata?.strong_areas?.length) && (
                    <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1rem 1.25rem' }}>
                        {metadata?.weak_areas?.length ? (
                            <div style={{ marginBottom: metadata?.strong_areas?.length ? '0.85rem' : 0 }}>
                                <div className="hud-label-small" style={{ marginBottom: '0.4rem' }}>WEAK AREAS</div>
                                <div className="text-small">{metadata.weak_areas.join(', ')}</div>
                            </div>
                        ) : null}
                        {metadata?.strong_areas?.length ? (
                            <div>
                                <div className="hud-label-small" style={{ marginBottom: '0.4rem' }}>STRONG AREAS</div>
                                <div className="text-small">{metadata.strong_areas.join(', ')}</div>
                            </div>
                        ) : null}
                    </div>
                )}
                {shareStatus === 'success' && (
                    <p className="share-feedback">Challenge link copied. Send it to a friend to start a head-to-head run.</p>
                )}
                {shareStatus === 'error' && (
                    <p className="share-feedback error">Could not copy challenge link. Try again.</p>
                )}
            </div>
        </div>
    );
}
