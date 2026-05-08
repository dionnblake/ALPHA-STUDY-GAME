import { useEffect, useState } from 'react';

export function EnvironmentIndicator() {
  const [env, setEnv] = useState<'dev' | 'staging' | 'production'>('production');

  useEffect(() => {
    // Detect environment from Tauri dev mode or URL
    const tauriWindow = window as Window & { __TAURI__?: unknown; __APP_ENV__?: unknown };
    const isTauriDev = tauriWindow.__TAURI__ !== undefined && import.meta.env.DEV;
    const hostname = window.location.hostname;

    let detected: 'dev' | 'staging' | 'production' = 'production';
    if (isTauriDev || hostname === 'localhost' || hostname === '127.0.0.1') {
      detected = 'dev';
    } else if (hostname.includes('staging')) {
      detected = 'staging';
    }

    setEnv(detected);

    // Expose to console for debugging
    tauriWindow.__APP_ENV__ = {
      environment: detected,
      isTauriDev,
      hostname,
      timestamp: new Date().toISOString()
    };

    console.log(`%cAI Study Game [${detected.toUpperCase()}]`, `color: #${detected === 'dev' ? 'ffa63d' : detected === 'staging' ? '9b5cff' : '57f287'}; font-weight: bold; font-size: 14px;`);
  }, []);

  const config = {
    dev: {
      bg: 'rgba(255, 159, 61, 0.15)',
      border: 'rgba(255, 159, 61, 0.4)',
      text: '#ffa63d',
      label: 'DEV'
    },
    staging: {
      bg: 'rgba(155, 92, 255, 0.15)',
      border: 'rgba(155, 92, 255, 0.4)',
      text: '#9b5cff',
      label: 'STAGING'
    },
    production: {
      bg: 'rgba(87, 242, 135, 0.15)',
      border: 'rgba(87, 242, 135, 0.4)',
      text: '#57f287',
      label: 'PRODUCTION'
    }
  };

  const current = config[env];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: current.bg,
        borderBottom: `1px solid ${current.border}`,
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.1em',
        color: current.text,
        textTransform: 'uppercase',
        zIndex: 9999,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {current.label}
    </div>
  );
}
