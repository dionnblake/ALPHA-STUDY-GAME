import { useEffect, useState } from "react";
import { getDashboardStats, DashboardStats } from "../services/analyticsService";

function getLast7DayLabels() {
  const labels: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    labels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
  }
  return labels;
}

export default function ActivityPanel() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Error loading activity data:", error);
      }
    }
    loadStats();
  }, []);

  const labels = getLast7DayLabels();
  const values = stats?.streakHistory ?? new Array(7).fill(0);
  const hasActivity = values.some((value) => value > 0);
  const activity = labels.map((label, i) => ({ label, value: values[i] ?? 0 }));

  return (
    <section className="glass-card panel">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Momentum</p>
          <h2 className="panel-title">Weekly study activity</h2>
        </div>
        <span style={{ color: "var(--text-3)", fontSize: 13 }}>7 day view</span>
      </div>

      {hasActivity ? (
        <div className="activity-bars">
          {activity.map((item) => (
            <div className="activity-col" key={item.label}>
              <div className="activity-bar" style={{ height: `${item.value}%` }} />
              <div className="activity-label">{item.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "2rem", color: "var(--text-3)", textAlign: "center" }}>
          No study sessions recorded in the last 7 days.
        </div>
      )}
    </section>
  );
}
