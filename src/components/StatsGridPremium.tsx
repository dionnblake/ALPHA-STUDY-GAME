import { DashboardStats } from '../services/analyticsService';

export default function StatsGridPremium({ stats }: { stats: DashboardStats | null }) {
  const isLoading = !stats;

  const items = [
    { 
      label: "Completed Missions", 
      value: isLoading ? "Loading" : stats.completedMissions, 
      delta: isLoading ? "Reading study sessions" : `+${stats.missionsThisWeek} this week`, 
      accent: "cyan", 
      icon: "OK", 
      tone: "positive" 
    },
    { 
      label: "Total XP", 
      value: isLoading ? "Loading" : stats.totalXP.toLocaleString(), 
      delta: isLoading ? "Reading profile data" : `+${stats.xpThisWeek} this week`, 
      accent: "purple", 
      icon: "XP", 
      tone: "positive" 
    },
    { 
      label: "Accuracy", 
      value: isLoading ? "Loading" : `${stats.accuracy}%`, 
      delta: isLoading ? "Reading answers" : `${stats.accuracyChange}% this week`, 
      accent: "pink", 
      icon: "%", 
      tone: !stats || stats.accuracyChange >= 0 ? "positive" : "warning" 
    },
    { 
      label: "Hours Studied", 
      value: isLoading ? "Loading" : stats.hoursStudied, 
      delta: isLoading ? "Reading durations" : `${stats.hoursThisWeek} this week`, 
      accent: "orange", 
      icon: "H", 
      tone: "warning" 
    },
  ];

  return (
    <section className="stats-grid fade-up delay-1">
      {items.map((stat) => (
        <div className="glass-card stat-card" key={stat.label} data-accent={stat.accent}>
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-label">{stat.label}</div>
          <div className="stat-value">{stat.value}</div>
          <div className={`stat-delta ${stat.tone}`}>{stat.delta}</div>
        </div>
      ))}
    </section>
  );
}
