import { Component, type ErrorInfo, type ReactNode } from 'react';
import { XCircle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#05070d',
          color: '#f5f7fa',
          fontFamily: 'sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <XCircle size={64} color="#ff5c5c" style={{ marginBottom: '20px' }} />
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Neural Link Severed</h1>
          <p style={{ opacity: 0.7, maxWidth: '500px', marginBottom: '30px' }}>
            A fatal sequence error occurred in the learning module. Context data follows:
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#ff5c5c',
            maxWidth: '90%',
            overflow: 'auto',
            marginBottom: '30px'
          }}>
            {this.state.error?.message || 'Unknown Crash'}
          </div>
          <button 
            style={{
              padding: '12px 24px',
              background: '#28d7ff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
            onClick={() => window.location.href = '/'}
          >
            RESTORE DASHBOARD
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
