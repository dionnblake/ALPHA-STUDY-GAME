import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard' },
  { path: '/quiz?track=google-ai-essentials', label: 'Google AI Essentials' },
  { path: '/quiz?track=google-ai-professional-cert', label: 'Google AI Professional' },
  { path: '/quiz?track=genai-on-google-cloud', label: 'GenAI on Google Cloud' },
  { path: '/quiz?track=prompt-engineering-full-course', label: 'Prompt Engineering' },
  { path: '/quiz?track=aws-certified-ai-practitioner', label: 'AWS Certified AI Practitioner' },
  { path: '/generative-ai-leader', label: 'Generative AI Leader' },
  { path: '/fill-in-blank', label: 'Fill in the Blank' },
  { path: '/flashcards', label: 'AI Concepts' },
  { path: '/progress', label: 'Performance' },
  { path: '/search', label: 'Search' },
  { path: '/settings', label: 'Settings' },
];

type SidebarProps = {
  allowOverflowScroll?: boolean;
};

export function Sidebar({ allowOverflowScroll = false }: SidebarProps) {
  const location = useLocation();
  const navListRef = useRef<HTMLDivElement | null>(null);
  const [hasNavOverflow, setHasNavOverflow] = useState(false);

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
          <div className="version-pill">v1.1.0-STABLE</div>
        </div>

      <div className="nav-list" ref={navListRef}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={() => `nav-item ${isNavItemActive(item.path) ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </div>

    </aside>
  );
}
