import { DashboardStats } from '../services/analyticsService';
import { DOMAINS } from '../services/examBlueprint';

export default function MasteryPanelPremium({ stats }: { stats: DashboardStats | null }) {

  const mastery = stats?.overallMastery ?? 0;
  const angle = mastery * 3.6;

  const legend = DOMAINS.map(domain => ({
    label: domain.name.replace(/^Domain \d+: /, ""),
    value: `${stats?.domainProgress?.[domain.id] ?? 0}%`,
    color: domain.color
  }));

  return (
    <section className="glass-card panel fade-up delay-3">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Overview</p>
          <h2 className="panel-title">AI mastery</h2>
        </div>
      </div>

      {!stats ? (
        <div style={{ padding: "2rem", color: "var(--text-3)", textAlign: "center" }}>
          Loading mastery from study history...
        </div>
      ) : (
        <>
      <div className="mastery-ring-wrap">
        <div
          className="mastery-ring"
          style={{
            background: `conic-gradient(var(--cyan) 0deg, #56c8ff 55deg, var(--purple) ${angle}deg, rgba(255,255,255,0.06) ${angle}deg 360deg)`,
            filter: "drop-shadow(0 0 12px rgba(40, 215, 255, 0.2))"
          }}
        >
          <div className="mastery-core">
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--cyan)', marginBottom: '4px', fontWeight: 800 }}>{stats?.rankTitle}</div>
              <div className="mastery-value" style={{ textShadow: "0 0 20px rgba(40, 215, 255, 0.3)" }}>{mastery}%</div>
              <div className="mastery-label">overall mastery</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mastery-legend">
        {legend.map((item) => (
          <div className="legend-row" key={item.label}>
            <span className="legend-dot" style={{ background: item.color, boxShadow: `0 0 14px ${item.color}` }} />
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
        </>
      )}
    </section>
  );
}
