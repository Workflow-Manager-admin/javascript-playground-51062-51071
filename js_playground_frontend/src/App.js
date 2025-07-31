import React from 'react';
import JavaScriptPlayground from './components/JavaScriptPlayground';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// PUBLIC_INTERFACE
function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <JavaScriptPlayground />
      </ErrorBoundary>
    </div>
  );
}

export default App;
