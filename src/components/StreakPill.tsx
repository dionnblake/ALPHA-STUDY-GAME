export default function StreakPill({ days }: { days: number }) {
  return (
    <div className="streak-pill">
      <span className="streak-badge" />
      <strong>{days} Day Streak</strong>
    </div>
  );
}
