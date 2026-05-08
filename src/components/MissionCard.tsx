type MissionCardProps = {
  index: number;
  title: string;
  subtitle: string;
  progress: number;
  xp: number;
  status: string;
  accent: string;
};

function statusStyle(status: string, accent: string) {
  const base = {
    background: "rgba(255,255,255,0.05)",
    color: accent,
    border: `1px solid ${accent}44`,
    boxShadow: `0 0 12px ${accent}22`,
  } as const;

  if (status === "Completed") {
    return {
      ...base,
      color: "var(--green)",
      border: "1px solid rgba(87,242,135,0.35)",
      background: "rgba(87,242,135,0.12)",
      boxShadow: "0 0 15px rgba(87,242,135,0.22)",
    };
  }

  if (status === "Next") {
    return {
      ...base,
      color: "var(--orange)",
      border: "1px solid rgba(255,166,61,0.35)",
      background: "rgba(255,166,61,0.12)",
      boxShadow: "0 0 15px rgba(255,166,61,0.22)",
    };
  }

  return base;
}

export default function MissionCard({
  index,
  title,
  subtitle,
  progress,
  xp,
  status,
  accent,
}: MissionCardProps) {
  return (
    <article className="mission-card">
      <div className="mission-top">
        <div>
          <p className="panel-kicker" style={{ marginBottom: 6 }}>Mission {index}</p>
          <h3 className="mission-title">{title}</h3>
          <p className="mission-subtitle">{subtitle}</p>
        </div>
        <div className="mission-status" style={statusStyle(status, accent)}>
          {status}
        </div>
      </div>

      <div className="progress">
        <div
          className="progress-fill"
          style={{
            width: `${Math.max(0, Math.min(100, progress * 100))}%`,
            background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.92))`,
            boxShadow: `0 10px 24px ${accent}33`,
          }}
        />
      </div>

      <div className="mission-meta">
        <span>{Math.round(progress * 100)}% complete</span>
        <strong style={{ color: "var(--cyan)", textShadow: "0 0 10px rgba(40, 215, 255, 0.4)" }}>{xp} XP</strong>
      </div>
    </article>
  );
}
