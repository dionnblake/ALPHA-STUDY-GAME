import { useNavigate } from "react-router-dom";

type FocusPanelPremiumProps = {
  rankTitle?: string;
  nextFocus?: string;
  isLoading?: boolean;
};

export default function FocusPanelPremium({ rankTitle = "AI Trainee", nextFocus, isLoading = false }: FocusPanelPremiumProps) {
  const navigate = useNavigate();
  const focusText = isLoading
    ? "Reading your latest study sessions to choose the next focus area."
    : nextFocus
    ? `Operational Status: ${rankTitle}. Priority: Raise ${nextFocus} mastery to unlock next-tier protocols.`
    : `Operational Status: ${rankTitle}. All primary tracks optimized. Continue deep pattern analysis to reach the next clearance level.`;

  return (
    <section className="glass-card cta-card fade-up delay-5">
      <div>
        <p className="panel-kicker">Current focus</p>
        <h2 className="panel-title" style={{ fontSize: 24, marginTop: 0 }}>
          {isLoading ? "Loading study focus" : rankTitle}
        </h2>
        <p style={{ color: "var(--text-2)", lineHeight: 1.6, margin: "10px 0 0" }}>
          {focusText}
        </p>
      </div>

      <button className="button-primary" type="button" onClick={() => navigate("/quiz?type=mixed")}>
        Resume Mission
      </button>
      <button className="button-secondary" type="button" onClick={() => navigate("/search")}>
        Review Study Plan
      </button>
    </section>
  );
}
