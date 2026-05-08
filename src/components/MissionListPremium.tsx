import { DashboardStats, TRACK_DEFINITIONS } from '../services/analyticsService';
import MissionCard from "./MissionCard";
import { DOMAINS } from '../services/examBlueprint';

export default function MissionListPremium({ stats }: { stats: DashboardStats | null }) {
  const isLoading = !stats;

  // Map domains to mission objects
  const missions = DOMAINS.map((domain, i) => {
    const progress = (stats?.domainProgress?.[domain.id] ?? 0) / 100;
    const xp = stats?.domainXP?.[domain.id] ?? 0;

    let status = "Next";
    if (progress >= 1) {
      status = "Completed";
    } else if (progress > 0) {
      status = "Active";
    }

    return {
      index: i + 1,
      domainId: domain.id,
      title: domain.name.replace(/^Domain \d+: /, ""), // Strip the prefix for UI
      subtitle: domain.categories[0], // Use first category as tag
      progress,
      xp,
      status,
      accent: domain.color,
    };
  });

  // Separate missions into two groups
  const coreAIMissions = missions.filter(m => m.domainId <= 5);
  const googleAICertMissions = missions.filter(m => m.domainId >= 6 && m.domainId <= 12);
  const genAICloudMissions = missions.filter(m => m.domainId === 13);
  const activeTrackCount = TRACK_DEFINITIONS.filter((track) => (stats?.trackProgress?.[track.tag] ?? 0) > 0).length;

  const googleCertProgress = googleAICertMissions.length > 0
    ? Math.round((googleAICertMissions.filter(m => m.status === "Completed").length / googleAICertMissions.length) * 100)
    : 0;

  return (
    <section className="glass-card panel fade-up delay-2">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Current roadmap</p>
          <h2 className="panel-title">Mission progress</h2>
        </div>
        <span style={{ color: "var(--text-3)", fontSize: 13 }}>
          {isLoading ? "Loading tracks" : `${activeTrackCount}/${TRACK_DEFINITIONS.length} tracks with study data`}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px", marginBottom: "16px" }}>
        {TRACK_DEFINITIONS.map((track) => {
          const value = stats?.trackProgress?.[track.tag] ?? 0;
          const hasStudyData = value > 0;
          return (
            <div key={track.tag} style={{ border: "1px solid var(--border-1)", borderRadius: "8px", padding: "8px 10px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                {track.label}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, marginTop: "2px" }}>
                {isLoading ? "Loading" : hasStudyData ? `${value}%` : "No attempts"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Core AI Domains Section */}
      <div style={{ marginBottom: coreAIMissions.length > 0 ? "24px" : "0" }}>
        {coreAIMissions.length > 0 && (
          <div style={{
            padding: "12px 0",
            marginBottom: "12px",
            borderBottom: "1px solid var(--border-1)",
            fontSize: "12px",
            fontWeight: "600",
            color: "var(--text-2)",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            Core AI Domains
          </div>
        )}
        <div className="mission-list">
          {coreAIMissions.map((mission) => (
            <MissionCard key={mission.index} {...mission} />
          ))}
        </div>
      </div>

      {/* Google AI Professional Certificate Section */}
      {googleAICertMissions.length > 0 && (
        <div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 0",
            marginBottom: "12px",
            borderTop: "2px solid var(--accent-blue)",
            borderBottom: "1px solid var(--border-1)",
            fontSize: "12px",
            fontWeight: "600",
            color: "#4FC3F7",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            <span>🎓</span>
            <span>Google AI Professional Certificate</span>
            <span style={{
              marginLeft: "auto",
              padding: "4px 8px",
              backgroundColor: "rgba(79, 195, 247, 0.15)",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: "700",
              color: "#4FC3F7"
            }}>
              {googleCertProgress}% Complete
            </span>
          </div>
          <div className="mission-list">
            {googleAICertMissions.map((mission) => (
              <MissionCard key={mission.index} {...mission} />
            ))}
          </div>
        </div>
      )}

      {/* GenAI on Google Cloud Section */}
      {genAICloudMissions.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 0",
            marginBottom: "12px",
            borderTop: "2px solid #7DD3FC",
            borderBottom: "1px solid var(--border-1)",
            fontSize: "12px",
            fontWeight: "600",
            color: "#7DD3FC",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            <span>GenAI on Google Cloud</span>
          </div>
          <div className="mission-list">
            {genAICloudMissions.map((mission) => (
              <MissionCard key={mission.index} {...mission} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
