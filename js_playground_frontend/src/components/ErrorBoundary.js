import React from 'react';

// PUBLIC_INTERFACE
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('JavaScript Playground Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2>🚨 Something went wrong</h2>
          <p>The JavaScript Playground encountered an error.</p>
          <details style={{ marginTop: '15px', textAlign: 'left' }}>
            <summary>Error details</summary>
            <pre style={{ 
              background: 'white', 
              padding: '10px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {this.state.error && this.state.error.toString()}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
