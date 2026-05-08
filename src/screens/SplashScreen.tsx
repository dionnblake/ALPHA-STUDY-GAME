// src/screens/SplashScreen.tsx
import { useEffect, useState } from 'react';
import { getDb, isDatabaseEmpty } from '../services/database';
import { seedDatabase } from '../services/seedingService';
import './SplashScreen.css';

interface SplashScreenProps {
    onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Initializing Core Database...');

    useEffect(() => {
        async function initApp() {
            try {
                await getDb();
                
                const needsSeeding = await isDatabaseEmpty();
                if (needsSeeding) {
                    setStatus('Syncing Question Caches...');
                    await seedDatabase((pct) => {
                        setProgress(pct);
                    });
                } else {
                    setProgress(100);
                }

                setTimeout(() => {
                    onComplete();
                }, 1200);

            } catch (error) {
                console.error("Failed to initialize app", error);
                setStatus(`SYSTEM FAULT: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        initApp();
    }, [onComplete]);

    return (
        <div className="splash-screen">
            <div className="splash-content">
                <div className="logo-vFX-box">AI</div>
                <h1 className="splash-title">Study Game</h1>
                
                <div className="init-container">
                    <div className="init-progress-bg">
                        <div 
                            className="init-progress-fill" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="init-status">{status} {progress}%</p>
                </div>
            </div>
        </div>
    );
}
