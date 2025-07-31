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
        <div className="container my-4">
          <div className="alert alert-danger" role="alert">
            <div className="text-center">
              <h2 className="alert-heading">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Something went wrong
              </h2>
              <p className="mb-3">The JavaScript Playground encountered an error.</p>
              
              <div className="accordion" id="errorAccordion">
                <div className="accordion-item">
                  <h3 className="accordion-header">
                    <button 
                      className="accordion-button collapsed" 
                      type="button" 
                      data-bs-toggle="collapse" 
                      data-bs-target="#errorDetails"
                    >
                      <i className="bi bi-info-circle me-2"></i>
                      Error Details
                    </button>
                  </h3>
                  <div id="errorDetails" className="accordion-collapse collapse">
                    <div className="accordion-body">
                      <pre className="bg-light p-3 rounded text-start" style={{
                        fontSize: '12px',
                        overflow: 'auto',
                        maxHeight: '200px'
                      }}>
                        {this.state.error && this.state.error.toString()}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-danger mt-3"
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
