import { AppProgressBar } from './AppProgressBar';
import { GlassCard } from './GlassCard';
import './ThemePrimitives.css';

interface MissionCardProps {
  index: number;
  title: string;
  subtitle: string;
  progress: number;
  xp: number;
  accent: string;
  status: string;
  onClick?: () => void;
}

export function MissionCard({
  index,
  title,
  subtitle,
  progress,
  xp,
  accent,
  status,
  onClick
}: MissionCardProps) {
  return (
    <GlassCard accent={accent} interactive onClick={onClick}>
      <div className="mission-card-header">
        <h3 className="mission-card-title">
          {index}. {title}
        </h3>
        <span className="text-small">{Math.round(progress)}%</span>
      </div>
      <p className="mission-card-subtitle">{subtitle}</p>
      <div className="mission-card-meta">
        <span className="mission-card-status">{status}</span>
        <span className="text-primary">{Math.round(progress)}%</span>
      </div>
      <AppProgressBar progress={progress} accent={accent} />
      <p className="mission-card-xp">XP: {xp}</p>
    </GlassCard>
  );
}
