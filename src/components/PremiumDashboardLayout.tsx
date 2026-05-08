import StreakPill from "./StreakPill";
import StatsGridPremium from "./StatsGridPremium";
import MissionListPremium from "./MissionListPremium";
import MasteryPanelPremium from "./MasteryPanelPremium";
import FocusPanelPremium from "./FocusPanelPremium";
import { useCallback, useEffect, useState } from "react";
import { DashboardStats, getDashboardStats } from "../services/analyticsService";
import { DOMAINS } from "../services/examBlueprint";

export default function PremiumDashboardLayout() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    }
  }, []);

  useEffect(() => {
    // Initial load
    loadStats();

    // Keep dashboard guidance current as progress changes.
    const interval = window.setInterval(() => {
      loadStats();
    }, 8000);

    // Refresh when returning to the app/tab.
    const onFocus = () => loadStats();
    const onVisibility = () => {
      if (document.visibilityState === "visible") loadStats();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadStats]);

  const streakDays = stats ? parseInt(stats.streakCount.split("d")[0], 10) : 0;
  const weakestDomainId = stats
    ? Object.entries(stats.domainProgress).sort((a, b) => a[1] - b[1])[0]?.[0]
    : undefined;
  const weakestDomain = weakestDomainId
    ? DOMAINS.find((d) => d.id === Number(weakestDomainId))
    : undefined;

  return (
    <>
      <div className="topbar fade-up">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Your active missions, mastery trend, and daily momentum in one place.
          </p>
        </div>
        <div className="topbar-right">
          <StreakPill days={streakDays} />
        </div>
      </div>

      <StatsGridPremium stats={stats} />

      <div style={{ height: 24 }} />

      <section className="dashboard-grid">
        <div className="left-stack">
          <MissionListPremium stats={stats} />
        </div>

        <div className="right-stack">
          <MasteryPanelPremium stats={stats} />
          <FocusPanelPremium
            rankTitle={stats?.rankTitle || "AI Trainee"}
            nextFocus={weakestDomain?.name}
            isLoading={!stats}
          />
        </div>
      </section>
    </>
  );
}
