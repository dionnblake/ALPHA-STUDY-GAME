import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardStats, getDashboardStats } from "../services/analyticsService";
import { DOMAINS } from "../services/examBlueprint";

export default function FocusPanel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setStats(await getDashboardStats());
      } catch (error) {
        console.error("Error loading focus data:", error);
      }
    }
    loadStats();
  }, []);

  const weakestDomainId = stats
    ? Object.entries(stats.domainProgress).sort((a, b) => a[1] - b[1])[0]?.[0]
    : undefined;
  const weakestDomain = weakestDomainId
    ? DOMAINS.find((domain) => domain.id === Number(weakestDomainId))
    : undefined;
  const focusTitle = stats?.rankTitle ?? "Loading study focus";
  const focusBody = stats
    ? weakestDomain
      ? `Your lowest current mastery is ${weakestDomain.name.replace(/^Domain \d+: /, "")}. Start the next quiz there.`
      : "Complete a quiz session so the app can recommend the next focus area."
    : "Reading your latest study sessions to choose the next focus area.";

  return (
    <section className="glass-card cta-card">
      <div>
        <p className="panel-kicker">Current focus</p>
        <h2 className="panel-title" style={{ fontSize: 22, marginTop: 0 }}>
          {focusTitle}
        </h2>
        <p style={{ color: "var(--text-2)", lineHeight: 1.6, margin: "10px 0 0" }}>
          {focusBody}
        </p>
      </div>

      <button className="button-primary" type="button" onClick={() => navigate("/quiz?type=mixed")}>Resume Mission</button>
      <button className="button-secondary" type="button" onClick={() => navigate("/search")}>Review Study Plan</button>
    </section>
  );
}
