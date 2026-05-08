// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

type ShortcutMap = {
    [key: string]: (e: KeyboardEvent) => void;
};

export function useKeyboardShortcuts(shortcuts: ShortcutMap, isActive: boolean = true) {
    useEffect(() => {
        if (!isActive) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const mods = [];
            if (e.ctrlKey) mods.push('ctrl');
            if (e.shiftKey) mods.push('shift');
            if (e.altKey) mods.push('alt');
            if (e.metaKey) mods.push('meta');

            const key = e.key.toLowerCase();
            const combo = mods.length > 0 ? `${mods.sort().join('+')}+${key}` : key;
            
            const action = shortcuts[combo] || shortcuts[key];
            
            if (action) {
                e.preventDefault();
                action(e);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts, isActive]);
}
