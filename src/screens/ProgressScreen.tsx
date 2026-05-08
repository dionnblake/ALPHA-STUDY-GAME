import { useEffect, useState } from 'react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { DashboardStats, getDashboardStats, TRACK_DEFINITIONS } from '../services/analyticsService';
import { AlertCircle, Target, TrendingUp, CheckCircle, Activity, BarChart } from 'lucide-react';
import './ProgressScreen.css';

export function ProgressScreen() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const s = await getDashboardStats();
                setStats(s);
            } catch (err: any) {
                console.error("Failed to load analytics", err);
                setError(err.message || "TELEMETRY LINK FAILURE");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) return (
        <div className="page-container flex-center">
            <div className="loading-hud">
                <div className="hud-pulse"></div>
                <h3>Deciphering Data Streams...</h3>
            </div>
        </div>
    );

    if (error || !stats) return (
        <div className="page-container flex-center">
            <div className="error-panel glass-panel">
                <AlertCircle size={48} color="var(--color-error)" />
                <h2 style={{ color: 'var(--color-error)', marginTop: '2rem' }}>INITIALIZATION ERROR</h2>
                <p className="text-muted" style={{ maxWidth: '400px', margin: '1rem auto' }}>
                    Critical failure in performance synchronization. Data records may be insufficient or corrupted.
                </p>
                <div className="diagnostic-prompt">Complete a study mission to generate neural telemetry.</div>
            </div>
        </div>
    );

    const domainPerformance = TRACK_DEFINITIONS.map((track) => ({
        subject: track.label,
        A: stats.trackProgress?.[track.tag] ?? 0,
        fullMark: 100
    }));

    const chartData = stats.sessionTrend.map((session, i) => {
        const date = new Date(session.startTimestamp);
        return {
            ...session,
            name: `Session ${i + 1}`,
            label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            time: date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
        };
    });

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-panel chart-tooltip">
                    <p className="hud-label-small" style={{ marginBottom: '4px' }}>{payload[0].payload.name}</p>
                    <p style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>{payload[0].value}%</p>
                    <p className="tooltip-detail">
                        {payload[0].payload.correctAnswers}/{payload[0].payload.totalQuestions} correct
                    </p>
                    <p className="tooltip-detail">
                        {payload[0].payload.label} at {payload[0].payload.time}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Dynamic Insights logic
    const weaknesses = Object.entries(stats.trackProgress || {})
        .filter(([_, acc]) => acc < 70)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 2);

    const strengths = Object.entries(stats.trackProgress || {})
        .filter(([_, acc]) => acc >= 70)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2);

    return (
        <div className="page-container progress-screen">
            <header className="screen-header">
                <span className="hud-label" style={{ color: 'var(--primary)' }}>SYSTEM STATUS: ANALYTICS ACTIVE</span>
                <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>User Performance Report</h1>
            </header>

            <div className="stats-grid">
                <div className="summary-hud-card">
                    <div className="hud-label-small">
                        <Target size={12} style={{ marginRight: '6px' }} />
                        TOTAL MASTERY
                    </div>
                    <div className="summary-val">{stats.overallMastery}%</div>
                    <div className="text-small text-muted">Objective Completion</div>
                </div>
                <div className="summary-hud-card" style={{ '--primary': 'var(--color-success)' } as any}>
                    <div className="hud-label-small">
                        <TrendingUp size={12} style={{ marginRight: '6px' }} />
                        AVG. ACCURACY
                    </div>
                    <div className="summary-val">{stats.accuracy}%</div>
                    <div className="text-small text-muted">Synaptic Precision</div>
                </div>
                <div className="summary-hud-card" style={{ '--primary': 'var(--domain-2)' } as any}>
                    <div className="hud-label-small">
                        <Activity size={12} style={{ marginRight: '6px' }} />
                        NEURAL SPEED
                    </div>
                    <div className="summary-val">{stats.avgSpeed}s</div>
                    <div className="text-small text-muted">Per Question Response</div>
                </div>
                <div className="summary-hud-card" style={{ '--primary': 'var(--domain-5)' } as any}>
                    <div className="hud-label-small">
                        <CheckCircle size={12} style={{ marginRight: '6px' }} />
                        TOTAL XP
                    </div>
                    <div className="summary-val">{stats.totalXP}</div>
                    <div className="text-small text-muted">Neural Nodes Processed</div>
                </div>
            </div>

            <div className="charts-layout">
                <div className="hologram-card glass-panel">
                    <div className="chart-hud-header">
                        <div className="chart-title">DOMAIN SYNCHRONIZATION</div>
                        <BarChart size={16} className="text-muted" />
                    </div>
                    <div style={{ height: '320px', width: '100%' }}>
                        <ResponsiveContainer>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={domainPerformance}>
                                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--text-muted)', fontWeight: 600 }} />
                                <Radar
                                    name="Mastery"
                                    dataKey="A"
                                    stroke="var(--primary)"
                                    fill="var(--primary)"
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="hologram-card glass-panel">
                    <div className="chart-hud-header">
                        <div>
                            <div className="chart-title">QUIZ ACCURACY BY STUDY SESSION</div>
                            <div className="chart-subtitle">Last {chartData.length} saved sessions from your study database</div>
                        </div>
                        <Activity size={16} className="text-muted" />
                    </div>
                    <div style={{ height: '320px', width: '100%' }}>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer>
                                <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -10, bottom: 4 }}>
                                    <defs>
                                        <linearGradient id="colorHud" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.08)" />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700 }}
                                        axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tickFormatter={(value) => `${value}%`}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="accuracy"
                                        stroke="var(--primary)"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorHud)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-chart-state">
                                Complete a quiz session and it will appear here with the date, score, and number correct.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="deep-analysis-row">
                <div className="analysis-hud glass-panel">
                    <div className="hud-label">
                        <AlertCircle size={14} style={{ color: 'var(--color-error)' }} />
                        <span>NEEDS REVIEW</span>
                    </div>
                    <div className="insight-list">
                        {weaknesses.length > 0 ? weaknesses.map(([tag, acc]) => {
                            const track = TRACK_DEFINITIONS.find((t) => t.tag === tag);
                            return (
                                <div className="insight-item" key={tag}>
                                    <div className="status-dot error"></div>
                                    <div className="insight-content">
                                        <h4>{track?.label || 'Unknown Track'}</h4>
                                        <p>Track accuracy is {acc}%. Prioritize this section in the next study cycle.</p>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="insight-item">
                                <div className="status-dot active"></div>
                                <div className="insight-content">
                                    <h4>No weak topics found yet</h4>
                                    <p>Your current study data does not show any track below the review threshold.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="analysis-hud glass-panel">
                    <div className="hud-label">
                        <CheckCircle size={14} style={{ color: 'var(--color-success)' }} />
                        <span>STRONGEST TOPICS</span>
                    </div>
                    <div className="insight-list">
                        {strengths.length > 0 ? strengths.map(([tag, acc]) => {
                            const track = TRACK_DEFINITIONS.find((t) => t.tag === tag);
                            return (
                                <div className="insight-item" key={tag}>
                                    <div className="status-dot active"></div>
                                    <div className="insight-content">
                                        <h4>{track?.label || 'High-Performance Track'}</h4>
                                        <p>Strong section performance detected ({acc}% accuracy).</p>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="insight-item">
                                <div className="status-dot active"></div>
                                <div className="insight-content">
                                    <h4>Calibration Required</h4>
                                    <p>Complete more study sessions to surface your strongest topics.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
