// src/screens/SettingsScreen.tsx
import { useEffect, useState } from 'react';
import {
    Moon, Sun, Monitor, Volume2, Target,
    CheckCircle, ShieldAlert, Cpu, Palette, RefreshCw
} from 'lucide-react';
import { getSettings, updateSettings, DEFAULT_SETTINGS } from '../services/settingsService';
import { Settings } from '../types/models';
import './SettingsScreen.css';

export function SettingsScreen() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        async function load() {
            const s = await getSettings();
            // Deep merge with defaults to ensure all keys exist (Hard Code Resilience)
            setSettings({ ...DEFAULT_SETTINGS, ...s });
        }
        load();
    }, []);

    const handleChange = async (key: keyof Settings, value: any) => {
        if (!settings) return;
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        await updateSettings(newSettings);

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);

        if (key === 'theme') {
            document.documentElement.setAttribute('data-theme', value);
        }
    };

    if (!settings) return <div className="page-container flex-center"><h3>Syncing Terminal Preferences...</h3></div>;

    return (
        <div className="page-container settings-screen-root">
            <header className="page-header">
                <span className="hud-label" style={{ color: 'var(--primary)' }}>SYSTEM: CONFIGURATION CONSOLE</span>
                <h1 style={{ fontSize: '2.5rem' }}>Global Settings</h1>
            </header>

            <div className="settings-layout-grid">
                {/* Visual Interface Module */}
                <section className="console-section">
                    <div className="console-header">
                        <Palette size={16} color="var(--primary)" />
                        <h3>Visual Interface</h3>
                    </div>
                    <div className="console-body">
                        <div className="theme-rail">
                            <button
                                className={`rail-btn ${settings.theme === 'light' ? 'is-active' : ''}`}
                                onClick={() => handleChange('theme', 'light')}
                            >
                                <Sun size={16} /> LIGHT
                            </button>
                            <button
                                className={`rail-btn ${settings.theme === 'dark' ? 'is-active' : ''}`}
                                onClick={() => handleChange('theme', 'dark')}
                            >
                                <Moon size={16} /> DARK
                            </button>
                            <button
                                className={`rail-btn ${settings.theme === 'system' ? 'is-active' : ''}`}
                                onClick={() => handleChange('theme', 'system')}
                            >
                                <Monitor size={16} /> AUTO
                            </button>
                        </div>
                    </div>
                </section>

                {/* Session Params Module */}
                <section className="console-section">
                    <div className="console-header">
                        <Cpu size={16} color="var(--primary)" />
                        <h3>Session Parameters</h3>
                    </div>
                    <div className="console-body">
                        <div className="setting-entry">
                            <div className="entry-meta">
                                <span className="entry-label">Tactic Timer</span>
                                <span className="entry-desc">Apply countdown pressure to quiz modules</span>
                            </div>
                            <label className="hud-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.quiz_timer_enabled}
                                    onChange={(e) => handleChange('quiz_timer_enabled', e.target.checked)}
                                />
                                <span className="hud-slider"></span>
                            </label>
                        </div>

                        {settings.quiz_timer_enabled && (
                            <div className="setting-entry">
                                <div className="entry-meta">
                                    <span className="entry-label">Time Allocation</span>
                                    <span className="entry-desc">{settings.quiz_timer_seconds}s per iteration</span>
                                </div>
                                <input
                                    type="range"
                                    className="hud-range"
                                    min="15"
                                    max="120"
                                    step="15"
                                    value={settings.quiz_timer_seconds}
                                    onChange={(e) => handleChange('quiz_timer_seconds', parseInt(e.target.value))}
                                />
                            </div>
                        )}
                    </div>
                </section>

                {/* Performance Goals Module */}
                <section className="console-section">
                    <div className="console-header">
                        <Target size={16} color="var(--primary)" />
                        <h3>Performance Goals</h3>
                    </div>
                    <div className="console-body">
                        <div className="setting-entry">
                            <div className="entry-meta">
                                <span className="entry-label">Daily Quota</span>
                                <span className="entry-desc">Target questions per synchronization</span>
                            </div>
                            <input
                                type="number"
                                className="hud-input-number"
                                value={settings.daily_goal_questions}
                                onChange={(e) => handleChange('daily_goal_questions', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="setting-entry">
                            <div className="entry-meta">
                                <span className="entry-label">Data Verbosity</span>
                                <span className="entry-desc">Detail level for feedback streams</span>
                            </div>
                            <select
                                className="hud-select"
                                value={settings.verbosity_level}
                                onChange={(e) => handleChange('verbosity_level', e.target.value)}
                            >
                                <option value="concise">CONCISE</option>
                                <option value="detailed">DETAILED</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Tactical Comms Module */}
                <section className="console-section">
                    <div className="console-header">
                        <Volume2 size={16} color="var(--primary)" />
                        <h3>Tactical Comms</h3>
                    </div>
                    <div className="console-body">
                        <div className="setting-entry">
                            <div className="entry-meta">
                                <span className="entry-label">Auditory Feedback</span>
                                <span className="entry-desc">Enable mission status sound FX</span>
                            </div>
                            <label className="hud-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.sound_enabled}
                                    onChange={(e) => handleChange('sound_enabled', e.target.checked)}
                                />
                                <span className="hud-slider"></span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Data Management Module */}
                <section className="console-section">
                    <div className="console-header">
                        <RefreshCw size={16} color="var(--primary)" />
                        <h3>Data Management</h3>
                    </div>
                    <div className="console-body">
                        <div className="setting-entry">
                            <div className="entry-meta">
                                <span className="entry-label">Sync Mission Data</span>
                                <span className="entry-desc">Refresh all question content with the latest corrections (Preserves progress)</span>
                            </div>
                            <button className="hud-btn" onClick={async () => {
                                if (window.confirm("Perform mission data synchronization? This will refresh all questions with the latest corrected transcripts. Your XP, history, and streaks will be preserved.")) {
                                    try {
                                        const { forceReSeedQuestions } = await import('../services/database');
                                        await forceReSeedQuestions();
                                        window.location.reload();
                                    } catch (e) {
                                        alert("MISSION SYNC FAILED: Database connection interrupted");
                                    }
                                }
                            }}>
                                REFRESH MISSION DATA
                            </button>
                        </div>
                    </div>
                </section>

                {/* Hard Reset Module */}
                <section className="console-section danger-section">
                    <div className="console-header danger-header">
                        <ShieldAlert size={16} color="#ef4444" />
                        <h3>System Purge</h3>
                    </div>
                    <div className="console-body">
                        <div className="setting-entry">
                            <div className="entry-meta">
                                <span className="entry-label">Reset Local Cache</span>
                                <span className="entry-desc">Permanently wipe all progress and metrics</span>
                            </div>
                            <button className="hud-btn-danger" onClick={async () => {
                                if (window.confirm("CRITICAL WARNING: This will permanently wipe ALL study data, achievements, and session history. Are you absolutely certain you wish to proceed with the terminal purge?")) {
                                    try {
                                        const { executeSystemPurge } = await import('../services/database');
                                        await executeSystemPurge();
                                        window.location.reload();
                                    } catch (e) {
                                        alert("SYSTEM PURGE FAILED: Security protocol error");
                                    }
                                }
                            }}>
                                EXECUTE PURGE
                            </button>
                        </div>
                    </div>
                </section>
                {/* About & Support Module */}
                <section className="console-section">
                    <div className="console-header">
                        <Monitor size={16} color="var(--primary)" />
                        <h3>About & Support</h3>
                    </div>
                    <div className="console-body">
                        <div className="about-info">
                            <div className="info-row">
                                <span>Version</span>
                                <span className="info-value">1.1.0-STABLE</span>
                            </div>
                            <div className="info-row">
                                <span>Architecture</span>
                                <span className="info-value">Tauri Core (Rust/React)</span>
                            </div>
                            <div className="info-row">
                                <span>Engine</span>
                                <span className="info-value">Adaptive Neural V2</span>
                            </div>
                        </div>
                        <div className="button-group" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <button className="hud-btn" onClick={() => window.open('https://github.com/', '_blank')}>
                                CHECK FOR UPDATES
                            </button>
                            <button className="hud-btn" onClick={() => window.open('https://discord.gg/', '_blank')}>
                                JOIN DISCORD
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {saved && (
                <div className="save-sync-toast">
                    <CheckCircle size={18} />
                    <span>PREFERENCES SYNCED</span>
                </div>
            )}
        </div>
    );
}
