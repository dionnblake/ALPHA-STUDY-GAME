// src/screens/AchievementsScreen.tsx
import { useEffect, useState } from 'react';
import { Medal, Lock, Trophy, Star, Shield, Zap, Target, Book, Calendar, Flame } from 'lucide-react';
import { getDb } from '../services/database';
import { Achievement } from '../types/models';
import './AchievementsScreen.css';

const ICON_MAP: Record<string, any> = {
    medals: Medal, trophy: Trophy, star: Star, shield: Shield, 
    zap: Zap, target: Target, book: Book, calendar: Calendar, flame: Flame
};

export function AchievementsScreen() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

    useEffect(() => {
        async function loadAchievements() {
            try {
                const db = await getDb();
                const data = await db.select<Achievement[]>('SELECT * FROM achievements');
                setAchievements(data);
            } catch (error) {
                console.error("Failed to load achievements", error);
            } finally {
                setLoading(false);
            }
        }
        loadAchievements();
    }, []);

    if (loading) return (
        <div className="page-container flex-center">
            <h3 className="hud-label-pulsate" style={{ color: 'var(--primary)' }}>ACCESSING MEMORY CORE...</h3>
        </div>
    );

    const filtered = achievements.filter(a => {
        if (filter === 'unlocked') return a.is_unlocked;
        if (filter === 'locked') return !a.is_unlocked;
        return true;
    });

    const unlockedCount = achievements.filter(a => a.is_unlocked).length;

    return (
        <div className="page-container achievements-root">
            <header className="achievements-header">
                <div className="header-text">
                    <span className="hud-label" style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'block' }}>
                        ACHIEVEMENT CATALOG
                    </span>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>MUSEUM OF COGNITION</h1>
                    <p className="hud-label-small" style={{ marginTop: '0.5rem' }}>
                        <span style={{ color: 'var(--primary)' }}>{unlockedCount}</span> / {achievements.length} ARTIFACTS DECRYPTED
                    </p>
                </div>
                <div className="hud-filter-tabs">
                    <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>ALL</button>
                    <button className={filter === 'unlocked' ? 'active' : ''} onClick={() => setFilter('unlocked')}>COLLECTED</button>
                    <button className={filter === 'locked' ? 'active' : ''} onClick={() => setFilter('locked')}>ENCRYPTED</button>
                </div>
            </header>

            <div className="achievements-stream">
                {filtered.map(a => {
                    const IconComponent = ICON_MAP[a.icon] || Medal;
                    const progress = (a.progress / a.requirement_value) * 100;

                    return (
                        <div key={a.id} className={`holographic-record-card ${a.is_unlocked ? 'is-unlocked' : 'is-locked'} rarity-${a.rarity}`}>
                            <div className="record-icon-vault">
                                {a.is_unlocked ? (
                                    <IconComponent className="record-icon" size={32} />
                                ) : (
                                    <Lock className="lock-icon" size={24} style={{ opacity: 0.5 }} />
                                )}
                            </div>
                            <div className="record-data">
                                <h3>{a.name.toUpperCase()}</h3>
                                <p>{a.description}</p>
                                
                                {!a.is_unlocked && (
                                    <div className="record-progress-hud">
                                        <div className="hud-progress-bg-mini">
                                            <div className="hud-progress-fill-neon" style={{ width: `${progress}%` }} />
                                        </div>
                                        <div className="hud-progress-labels-small">
                                            <span>PROGRESS</span>
                                            <span>{a.progress} / {a.requirement_value}</span>
                                        </div>
                                    </div>
                                )}
                                {a.is_unlocked && (
                                    <span className="hud-label-small" style={{ color: 'var(--color-success)' }}>
                                        SYNCHRONIZED {new Date(a.unlock_timestamp!).toLocaleDateString().toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="record-rarity-tag">{a.rarity}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
