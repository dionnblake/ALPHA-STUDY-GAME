// src/screens/AchievementsScreen.tsx
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Medal, Lock, Trophy, Star, Shield, Zap, Target, Book, Calendar, Flame } from 'lucide-react';
import { getDb } from '../services/database';
import { Achievement } from '../types/models';
import './AchievementsScreen.css';

const ICON_MAP: Record<string, any> = {
    medals: Medal, trophy: Trophy, star: Star, shield: Shield, 
    zap: Zap, target: Target, book: Book, calendar: Calendar, flame: Flame
};

function HolographicRecordCard({ a }: { a: Achievement }) {
    const IconComponent = ICON_MAP[a.icon] || Medal;
    const progress = (a.progress / a.requirement_value) * 100;

    // Framer motion coordinates for mouse hover 3D parallax
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Spring interpolation for buttery smooth movement
    const rotateX = useSpring(useTransform(y, [-100, 100], [12, -12]), { stiffness: 200, damping: 20 });
    const rotateY = useSpring(useTransform(x, [-100, 100], [-12, 12]), { stiffness: 200, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left - width / 2;
        const mouseY = e.clientY - rect.top - height / 2;
        x.set(mouseX);
        y.set(mouseY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div 
            className={`holographic-record-card ${a.is_unlocked ? 'is-unlocked' : 'is-locked'} rarity-${a.rarity}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                perspective: 1000
            }}
            whileHover={{ scale: 1.02, boxShadow: '0 12px 30px rgba(var(--primary-rgb), 0.25)' }}
            transition={{ duration: 0.15 }}
        >
            <div className="record-icon-vault" style={{ transform: 'translateZ(35px)' }}>
                {a.is_unlocked ? (
                    <IconComponent className="record-icon" size={32} />
                ) : (
                    <Lock className="lock-icon" size={24} style={{ opacity: 0.5 }} />
                )}
            </div>
            <div className="record-data" style={{ transform: 'translateZ(20px)' }}>
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
                    <span className="hud-label-small" style={{ color: 'var(--color-success)', display: 'block', marginTop: '0.5rem' }}>
                        SYNCHRONIZED {new Date(a.unlock_timestamp!).toLocaleDateString().toUpperCase()}
                    </span>
                )}
            </div>
            <div className="record-rarity-tag" style={{ transform: 'translateZ(25px)' }}>{a.rarity}</div>
        </motion.div>
    );
}

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
                {filtered.map(a => (
                    <HolographicRecordCard key={a.id} a={a} />
                ))}
            </div>
        </div>
    );
}
