// src/hooks/useTheme.ts
import { useEffect, useState } from 'react';
import { getSettings } from '../services/settingsService';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        // Load initial theme from DB
        getSettings().then(settings => {
             setTheme(settings.theme || 'dark');
        });
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        
        let actualTheme = theme;
        if (theme === 'system') {
            actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        root.setAttribute('data-theme', actualTheme);
    }, [theme]);

    return { theme, setTheme };
}
