import { useEffect, useState } from "react";
import MissionCard from "./MissionCard";
import { getDashboardStats, DashboardStats } from "../services/analyticsService";
import { DOMAINS } from "../services/examBlueprint";

export default function MissionList() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
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
          <p className="panel-kicker">Current roadmap</p>
          <h2 className="panel-title">Mission progress</h2>
        </div>
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>
          Loading mission progress from study history.
        </div>
      </section>
    );
  }

  const getStatus = (progress: number) => {
    if (progress >= 1) return "Completed";
    if (progress > 0) return "Active";
    return "Next";
  };

  const missions = DOMAINS.map((domain) => {
    const progress = (stats.domainProgress[domain.id] || 0) / 100;
    const xp = stats.domainXP[domain.id] || 0;
    const status = getStatus(progress);

    return {
      index: domain.id,
      title: domain.name.split(":")[1]?.trim() || domain.name,
      subtitle: domain.categories[0] || "Studies",
      progress,
      xp,
      status,
      accent: domain.color,
    };
  });

  return (
    <section className="glass-card panel">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Current roadmap</p>
          <h2 className="panel-title">Mission progress</h2>
        </div>
        <span style={{ color: "var(--text-3)", fontSize: 13 }}>
          {missions.length} active tracks
        </span>
      </div>

      <div className="mission-list">
        {missions.map((m) => (
          <MissionCard
            key={m.index}
            index={m.index}
            title={m.title}
            subtitle={m.subtitle}
            progress={m.progress}
            xp={m.xp}
            status={m.status}
            accent={m.accent}
          />
        ))}
      </div>
    </section>
  );
}
