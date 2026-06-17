import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Cloud,
  Code,
  Crown,
  FlaskConical,
  LayoutDashboard,
  Layers,
  PenLine,
  Search,
  Settings,
  Sparkles,
  Terminal,
  Trophy,
} from 'lucide-react';
import { getDashboardStats } from '../services/analyticsService';
import pkg from '../../package.json';
import './Sidebar.css';

type IconComponent = typeof LayoutDashboard;

type NavItem = {
  path: string;
  label: string;
  icon: IconComponent;
  /** Track tag from analyticsService TRACK_DEFINITIONS, for per-track progress. */
  trackTag?: string;
};

type NavSection = {
  id: string;
  kicker: string | null;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'top',
    kicker: null,
    items: [{ path: '/', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    id: 'tracks',
    kicker: 'Study Tracks',
    items: [
      { path: '/quiz?track=google-ai-essentials', label: 'Google AI Essentials', icon: Sparkles, trackTag: 'google-ai-essentials' },
      { path: '/quiz?track=google-ai-professional-cert', label: 'Google AI Professional', icon: Brain, trackTag: 'google-ai-professional-cert' },
      { path: '/quiz?track=genai-on-google-cloud', label: 'GenAI on Google Cloud', icon: Cloud, trackTag: 'genai-on-google-cloud' },
      { path: '/quiz?track=prompt-engineering-full-course', label: 'Prompt Engineering', icon: Terminal, trackTag: 'prompt-engineering-full-course' },
      { path: '/quiz?track=aws-certified-ai-practitioner', label: 'AWS Certified AI Practitioner', icon: Award, trackTag: 'aws-certified-ai-practitioner' },
      { path: '/generative-ai-leader', label: 'Generative AI Leader', icon: Crown, trackTag: 'google-generative-ai-leader' },
    ],
  },
  {
    id: 'practice',
    kicker: 'Practice',
    items: [
      { path: '/fill-in-blank', label: 'Fill in the Blank', icon: PenLine },
      { path: '/flashcards', label: 'AI Concepts', icon: Layers },
      { path: '/scenario-labs', label: 'Scenario Labs', icon: FlaskConical },
    ],
  },
  {
    id: 'python',
    kicker: 'Python',
    items: [
      { path: '/learn-python', label: 'Learn Python', icon: Code },
      { path: '/python-reader', label: 'Review Before Run', icon: BookOpen },
    ],
  },
  {
    id: 'insights',
    kicker: 'Insights',
    items: [
      { path: '/progress', label: 'Performance', icon: BarChart3 },
      { path: '/achievements', label: 'Trophy Room', icon: Trophy },
    ],
  },
  {
    id: 'system',
    kicker: 'System',
    items: [
      { path: '/search', label: 'Search', icon: Search },
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

type SidebarProps = {
  allowOverflowScroll?: boolean;
};

export function Sidebar({ allowOverflowScroll = false }: SidebarProps) {
  const location = useLocation();
  const navListRef = useRef<HTMLDivElement | null>(null);
  const [hasNavOverflow, setHasNavOverflow] = useState(false);
  const [trackProgress, setTrackProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const navEl = navListRef.current;
    if (!navEl) return;

    const syncOverflowState = () => {
      // Keep 1px tolerance for fractional layout values under zoom.
      setHasNavOverflow(navEl.scrollHeight - navEl.clientHeight > 1);
    };

    syncOverflowState();

    const resizeObserver = new ResizeObserver(syncOverflowState);
    resizeObserver.observe(navEl);
    window.addEventListener('resize', syncOverflowState);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncOverflowState);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadTrackProgress = async () => {
      try {
        const stats = await getDashboardStats();
        if (!cancelled) setTrackProgress(stats.trackProgress);
      } catch {
        // DB not ready or query failed: simply show no percentages.
      }
    };

    loadTrackProgress();
    const handleFocus = () => {
      void loadTrackProgress();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const isNavItemActive = (targetPath: string) => {
    const currentUrl = new URL(`${location.pathname}${location.search}`, 'http://localhost');
    const targetUrl = new URL(targetPath, 'http://localhost');

    if (currentUrl.pathname !== targetUrl.pathname) {
      return false;
    }

    // For quiz tracks, require the query string to match so only one track lights up.
    if (targetUrl.search) {
      return currentUrl.search === targetUrl.search;
    }

    return currentUrl.search === '';
  };

  const shouldShowSidebarScroll = allowOverflowScroll && hasNavOverflow;

  return (
    <aside className={`sidebar ${shouldShowSidebarScroll ? 'sidebar-overflowing' : ''}`}>
      <div className="brand-block">
        <div className="brand-kicker">AI Study</div>
        <h1 className="brand-title">AI Command Center</h1>
          <p className="brand-subtitle">
            Cognitive Hardening Platform
          </p>
          <div className="version-pill">{`v${pkg.version}`}</div>
        </div>

      <div className="nav-list" ref={navListRef}>
        {NAV_SECTIONS.map((section) => (
          <div className="nav-section" key={section.id}>
            {section.kicker && <div className="nav-section-kicker">{section.kicker}</div>}
            {section.items.map((item) => {
              const Icon = item.icon;
              const progress = item.trackTag ? trackProgress[item.trackTag] ?? 0 : 0;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={() => `nav-item ${isNavItemActive(item.path) ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" size={16} aria-hidden="true" />
                  <span className="nav-label">{item.label}</span>
                  {progress > 0 && (
                    <span className={`nav-progress ${progress >= 70 ? 'nav-progress-high' : ''}`}>
                      {progress}%
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

    </aside>
  );
}
