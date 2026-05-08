import type { CSSProperties } from 'react';
import './ThemePrimitives.css';

interface AppProgressBarProps {
  progress: number;
  accent?: string;
}

export function AppProgressBar({ progress, accent }: AppProgressBarProps) {
  const normalized = Math.min(Math.max(progress, 0), 100);
  const style = {
    '--accent-color': accent ?? 'var(--primary)',
    width: `${normalized}%`
  } as CSSProperties;

  return (
    <div className="app-progress-track">
      <div className="app-progress-fill" style={style} />
    </div>
  );
}
