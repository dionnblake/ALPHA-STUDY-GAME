// src/components/AppShell.tsx
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useTheme } from '../hooks/useTheme';
import { ErrorBoundary } from './ErrorBoundary';
import { motion, useReducedMotion } from 'framer-motion';

import { HomeScreen } from '../screens/HomeScreen';
import { SplashScreen } from '../screens/SplashScreen';

const QuizScreen = lazy(() => import('../screens/QuizScreen').then(m => ({ default: m.QuizScreen })));
const SessionSummaryScreen = lazy(() => import('../screens/SessionSummaryScreen').then(m => ({ default: m.SessionSummaryScreen })));
const SearchScreen = lazy(() => import('../screens/SearchScreen').then(m => ({ default: m.SearchScreen })));
const ProgressScreen = lazy(() => import('../screens/ProgressScreen').then(m => ({ default: m.ProgressScreen })));
const AchievementsScreen = lazy(() => import('../screens/AchievementsScreen').then(m => ({ default: m.AchievementsScreen })));
const FlashcardsScreen = lazy(() => import('../screens/FlashcardsScreen').then(m => ({ default: m.FlashcardsScreen })));
const SettingsScreen = lazy(() => import('../screens/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const ScenarioLabsScreen = lazy(() => import('../screens/ScenarioLabsScreen').then(m => ({ default: m.ScenarioLabsScreen })));
const PythonReaderScreen = lazy(() => import('../screens/PythonReaderScreen').then(m => ({ default: m.PythonReaderScreen })));
const LearningPythonScreen = lazy(() => import('../screens/LearningPythonScreen').then(m => ({ default: m.LearningPythonScreen })));


const ZOOM_MIN = 0.65;
const ZOOM_MAX = 1.4;
const ZOOM_BASE_STEP = 1.08;

function clampZoom(value: number) {
    return Math.min(Math.max(value, ZOOM_MIN), ZOOM_MAX);
}

export function AppShell() {
    useTheme();
    const [isReady, setIsReady] = useState(false);
    const [zoom, setZoom] = useState(() => {
        const saved = Number(window.localStorage.getItem('app_zoom_level'));
        return Number.isFinite(saved) ? clampZoom(saved) : 1;
    });
    const mainAreaRef = useRef<HTMLElement>(null);
    const wheelDeltaRef = useRef(0);
    const wheelFrameRef = useRef<number | null>(null);

    const commitZoom = (next: number) => {
        const clamped = clampZoom(next);
        setZoom(clamped);
        document.documentElement.style.setProperty('--app-zoom', clamped.toString());
        window.localStorage.setItem('app_zoom_level', clamped.toString());
    };

    const adjustZoomByFactor = (factor: number) => {
        setZoom(prev => {
            const next = clampZoom(prev * factor);
            document.documentElement.style.setProperty('--app-zoom', next.toString());
            window.localStorage.setItem('app_zoom_level', next.toString());
            return next;
        });
    };

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (!e.ctrlKey) return;
            e.preventDefault();

            wheelDeltaRef.current += -e.deltaY;
            if (wheelFrameRef.current !== null) return;

            wheelFrameRef.current = window.requestAnimationFrame(() => {
                const steps = wheelDeltaRef.current / 120;
                wheelDeltaRef.current = 0;
                wheelFrameRef.current = null;

                if (steps === 0) return;
                const factor = Math.pow(ZOOM_BASE_STEP, steps);
                adjustZoomByFactor(factor);
            });
        };

        const handleZoomHotkey = (e: KeyboardEvent) => {
            if (!(e.ctrlKey || e.metaKey)) return;

            if (e.key === '=' || e.key === '+') {
                e.preventDefault();
                adjustZoomByFactor(ZOOM_BASE_STEP);
                return;
            }

            if (e.key === '-') {
                e.preventDefault();
                adjustZoomByFactor(1 / ZOOM_BASE_STEP);
                return;
            }

            if (e.key === '0') {
                e.preventDefault();
                commitZoom(1);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Block hard-refresh shortcuts in Tauri dev window.
            // F5/Ctrl+R can navigate the webview to localhost and strand the app on a browser error page.
            const isRefreshKey = e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r');
            if (isRefreshKey) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            const target = e.target as HTMLElement | null;
            const isEditableTarget = target && (
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
                target.isContentEditable
            );
            if (isEditableTarget) return;

            const mainArea = mainAreaRef.current;
            if (!mainArea) return;

            const scrollAmount = 40;
            const pageScrollAmount = mainArea.clientHeight * 0.8;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    mainArea.scrollBy(0, -scrollAmount);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    mainArea.scrollBy(0, scrollAmount);
                    break;
                case 'PageUp':
                    e.preventDefault();
                    mainArea.scrollBy(0, -pageScrollAmount);
                    break;
                case 'PageDown':
                    e.preventDefault();
                    mainArea.scrollBy(0, pageScrollAmount);
                    break;
                case 'Home':
                    e.preventDefault();
                    mainArea.scrollTo(0, 0);
                    break;
                case 'End':
                    e.preventDefault();
                    mainArea.scrollTo(0, mainArea.scrollHeight);
                    break;
                default:
                    return; // Don't prevent default for other keys
            }
        };

        // Attach listeners to window/document so they always work
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', handleZoomHotkey, false);
        document.addEventListener('keydown', handleKeyDown, false);

        return () => {
            if (wheelFrameRef.current !== null) {
                window.cancelAnimationFrame(wheelFrameRef.current);
            }
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleZoomHotkey);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty('--app-zoom', zoom.toString());
        window.localStorage.setItem('app_zoom_level', zoom.toString());
    }, [zoom]);

    if (!isReady) {
        return <SplashScreen onComplete={() => setIsReady(true)} />;
    }

    return (
        <HashRouter>
            <AppContent zoom={zoom} mainAreaRef={mainAreaRef} />
        </HashRouter>
    );
}

function AppContent({ zoom, mainAreaRef }: { zoom: number, mainAreaRef: React.MutableRefObject<HTMLElement | null> }) {
    const location = useLocation();
    const reduceMotion = useReducedMotion();
    const routeKey = `${location.pathname}${location.search}`;
    const isQuizRoute = location.pathname === '/quiz'
        || location.pathname === '/generative-ai-leader'
        || location.pathname === '/fill-in-blank';
    const isPythonReaderRoute = location.pathname === '/python-reader';
    const isLearnPythonRoute = location.pathname === '/learn-python';
    const isMaxZoom = zoom >= 1.32;
    const needsSidebarScroll = zoom >= 1.1;
    const isReaderMaxZoom = isPythonReaderRoute && isMaxZoom;
    const isLearnPyMaxZoom = isLearnPythonRoute && isMaxZoom;

    return (
        <div
            className={`app-shell ${isQuizRoute && isMaxZoom ? 'quiz-max-zoom' : ''} ${isReaderMaxZoom ? 'reader-max-zoom' : ''} ${isLearnPyMaxZoom ? 'learnpy-max-zoom' : ''} ${needsSidebarScroll ? 'sidebar-scroll-enabled' : ''}`}
            style={{ '--app-zoom': zoom } as any}
        >
            <Sidebar allowOverflowScroll={needsSidebarScroll} />
            <main className={`main-area ${isQuizRoute ? 'quiz-main-area' : ''}`} id="main-scroll-area" ref={mainAreaRef} tabIndex={0}>
                <ErrorBoundary>
                    {/* Entry-only animation: AnimatePresence mode="wait" deadlocks when a
                        lazy route suspends inside it, leaving the previous screen stuck. */}
                    <motion.div
                            key={routeKey}
                            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
                            transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            style={{ height: "100%" }}
                        >
                            <Suspense fallback={<div className="page-container flex-center"><h3>Loading…</h3></div>}>
                            <Routes location={location} key={routeKey}>
                                <Route path="/" element={<HomeScreen />} />
                                <Route path="/quiz" element={<QuizScreen />} />
                                <Route path="/generative-ai-leader" element={<QuizScreen />} />
                                <Route path="/fill-in-blank" element={<QuizScreen />} />
                                <Route path="/summary" element={<SessionSummaryScreen />} />
                                <Route path="/search" element={<SearchScreen />} />
                                <Route path="/progress" element={<ProgressScreen />} />
                                <Route path="/achievements" element={<AchievementsScreen />} />
                                <Route path="/scenario-labs" element={<ScenarioLabsScreen />} />
                                <Route path="/python-reader" element={<PythonReaderScreen />} />
                                <Route path="/learn-python" element={<LearningPythonScreen />} />
                                <Route path="/flashcards" element={<FlashcardsScreen />} />
                                <Route path="/settings" element={<SettingsScreen />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                            </Suspense>
                    </motion.div>
                </ErrorBoundary>
            </main>
        </div>
    );
}
