import { useEffect, useState } from 'react';
import { getDashboardStats, DashboardStats } from '../services/analyticsService';

export default function StatsGrid() {
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
      <section className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-label">Loading study stats</div>
        </div>
      </section>
    );
  }

  const formatDelta = (value: number, suffix: string = "") => {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value}${suffix} this week`;
  };

  const statItems = [
    {
      label: "Completed Missions",
      value: stats.completedMissions.toString(),
      delta: formatDelta(stats.missionsThisWeek),
    },
    {
      label: "Total XP",
      value: stats.totalXP.toLocaleString(),
      delta: formatDelta(stats.xpThisWeek),
    },
    {
      label: "Accuracy",
      value: `${stats.accuracy}%`,
      delta: formatDelta(stats.accuracyChange, "%"),
    },
    {
      label: "Hours Studied",
      value: stats.hoursStudied.toString(),
      delta: formatDelta(stats.hoursThisWeek),
    },
  ];

  return (
    <section className="stats-grid">
      {statItems.map((stat) => (
        <div className="glass-card stat-card" key={stat.label}>
          <div className="stat-label">{stat.label}</div>
          <div className="stat-value">{stat.value}</div>
          <div className="stat-delta">{stat.delta}</div>
        </div>
      ))}
    </section>
  );
}
