import { useEffect, useState } from "react";
import StreakPill from "./StreakPill";
import StatsGrid from "./StatsGrid";
import MissionList from "./MissionList";
import MasteryPanel from "./MasteryPanel";
import ActivityPanel from "./ActivityPanel";
import FocusPanel from "./FocusPanel";
import { getDashboardStats, DashboardStats } from "../services/analyticsService";
import { useNavigate } from "react-router-dom";

export default function DashboardLayout() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats() {
      try {
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      }
    }
    loadStats();
  }, []);

  // Extract streak days from streakCount (format: "21d/14d")
  const streakDays = stats ? parseInt(stats.streakCount.split('d')[0]) : 0;

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Your active missions, mastery trend, and daily momentum in one place.
          </p>
        </div>
        <div className="topbar-right">
          <button className="button-secondary" type="button" onClick={() => navigate("/search")}>
            Search study bank
          </button>
          <StreakPill days={streakDays} />
        </div>
      </div>

      <StatsGrid />

      <div style={{ height: 24 }} />

      <section className="dashboard-grid">
        <div className="left-stack">
          <MissionList />
          <ActivityPanel />
        </div>

        <div className="right-stack">
          <MasteryPanel />
          <FocusPanel />
        </div>
      </section>
    </>
  );
}
