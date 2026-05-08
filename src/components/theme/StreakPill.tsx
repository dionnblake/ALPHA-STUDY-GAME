import { Flame } from 'lucide-react';
import './ThemePrimitives.css';

interface StreakPillProps {
  streakDays: number;
}

export function StreakPill({ streakDays }: StreakPillProps) {
  return (
    <div className="streak-pill">
      <Flame size={16} color="var(--domain-2)" />
      <span>Study Streak:</span>
      <span className="days">{streakDays} DAYS</span>
    </div>
  );
}
