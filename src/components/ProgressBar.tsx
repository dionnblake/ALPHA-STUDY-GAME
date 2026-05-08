interface ProgressBarProps {
  /** Value between 0 and 1 (e.g. 0.6 = 60%) */
  progress: number;
  /** Optional accent color — defaults to --accent-cyan */
  accent?: string;
}

export default function ProgressBar({ progress, accent }: ProgressBarProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  return (
    <div className="progress">
      <div
        className="progress-fill"
        style={{
          width: `${clamped * 100}%`,
          ...(accent ? { background: `linear-gradient(to right, ${accent}, #ffffff)` } : {}),
        }}
      />
    </div>
  );
}
