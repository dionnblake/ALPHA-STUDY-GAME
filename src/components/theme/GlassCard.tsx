import type { CSSProperties, ReactNode } from 'react';
import './ThemePrimitives.css';

interface GlassCardProps {
  children: ReactNode;
  accent?: string;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, accent, className, interactive = false, onClick }: GlassCardProps) {
  const style = accent ? ({ '--accent-color': accent } as CSSProperties) : undefined;
  const classes = `glass-card-theme ${interactive ? 'interactive' : ''} ${className ?? ''}`.trim();

  return (
    <div className={classes} style={style} onClick={onClick}>
      <div className="glass-card-body">{children}</div>
    </div>
  );
}
