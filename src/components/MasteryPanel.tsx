import { useEffect, useState } from 'react';
import { getDashboardStats, DashboardStats } from '../services/analyticsService';
import { DOMAINS } from '../services/examBlueprint';

export default function MasteryPanel() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <section className="glass-card panel">
        <div className="panel-header">
          <p className="panel-kicker">Overview</p>
          <h2 className="panel-title">AI mastery</h2>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading mastery from study history.
        </div>
      </section>
    );
  }

  const mastery = stats.overallMastery;
  const angle = mastery * 3.6;

  // Build legend from domain progress
  const legend = DOMAINS.map((domain) => ({
    label: domain.name.split(':')[1]?.trim() || domain.name,
    value: `${stats.domainProgress[domain.id] || 0}%`,
    color: domain.color,
  }));

  return (
    <section className="glass-card panel">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Overview</p>
          <h2 className="panel-title">AI mastery</h2>
        </div>
      </div>

      <div className="mastery-ring-wrap">
        <div
          className="mastery-ring"
          style={{
            background: `conic-gradient(var(--cyan) 0deg, var(--purple) ${angle}deg, rgba(255,255,255,0.06) ${angle}deg 360deg)`,
          }}
        >
          <div className="mastery-core">
            <div>
              <div className="mastery-value">{mastery}%</div>
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
    </section>
  );
}
