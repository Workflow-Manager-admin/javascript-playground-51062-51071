import React from 'react';
import './LoadingSpinner.css';

// PUBLIC_INTERFACE
function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center p-5">
      <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted mb-0">
        <i className="bi bi-hourglass-split me-2"></i>
        {message}
      </p>
    </div>
  );
}

export default LoadingSpinner;
