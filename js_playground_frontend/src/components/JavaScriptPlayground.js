import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './JavaScriptPlayground.css';

// PUBLIC_INTERFACE
function JavaScriptPlayground() {
  const [code, setCode] = useState('// Welcome to JavaScript Playground!\n// Write your JavaScript code here and click Run to execute it\n\nconsole.log("Hello, World!");\n\n// Try some examples:\n// Math.random()\n// new Date().toISOString()\n// [1, 2, 3].map(x => x * 2)');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [savedSnippets, setSavedSnippets] = useState([]);
  const [snippetName, setSnippetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [syntaxValid, setSyntaxValid] = useState(true);
  const editorRef = useRef(null);

  // Load saved snippets from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('jsPlaygroundSnippets');
    if (saved) {
      try {
        setSavedSnippets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved snippets:', e);
      }
    }

    // Load code from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const sharedCode = urlParams.get('code');
    if (sharedCode) {
      try {
        const decodedCode = atob(sharedCode);
        setCode(decodedCode);
      } catch (e) {
        console.error('Failed to decode shared code:', e);
      }
    }
  }, []);

  // PUBLIC_INTERFACE
  const runCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      // Create a custom console for capturing output
      const logs = [];
      const customConsole = {
        log: (...args) => logs.push(['log', ...args]),
        error: (...args) => logs.push(['error', ...args]),
        warn: (...args) => logs.push(['warn', ...args]),
        info: (...args) => logs.push(['info', ...args])
      };

      // Create a safe execution environment
      // eslint-disable-next-line no-new-func
      const safeEval = new Function(
        'console', 
        'setTimeout', 
        'setInterval', 
        'clearTimeout', 
        'clearInterval',
        `
        try {
          ${code}
        } catch (error) {
          console.error('Runtime Error:', error.message);
        }
        `
      );

      // Execute code with limited global access
      safeEval(
        customConsole,
        () => {}, // Disabled setTimeout
        () => {}, // Disabled setInterval
        () => {}, // Disabled clearTimeout
        () => {}  // Disabled clearInterval
      );

      // Format output
      const formattedLogs = logs.map(([type, ...args]) => {
        const formattedArgs = args.map(arg => {
          if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2);
          }
          return String(arg);
        }).join(' ');
        
        return `[${type.toUpperCase()}] ${formattedArgs}`;
      }).join('\n');

      setOutput(formattedLogs || 'Code executed successfully (no output)');
    } catch (error) {
      setOutput(`Syntax Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // PUBLIC_INTERFACE
  const saveSnippet = () => {
    if (!snippetName.trim()) {
      alert('Please enter a name for the snippet');
      return;
    }

    const newSnippet = {
      id: Date.now(),
      name: snippetName.trim(),
      code: code,
      createdAt: new Date().toISOString()
    };

    const updatedSnippets = [...savedSnippets, newSnippet];
    setSavedSnippets(updatedSnippets);
    localStorage.setItem('jsPlaygroundSnippets', JSON.stringify(updatedSnippets));
    
    setSnippetName('');
    setShowSaveDialog(false);
  };

  // PUBLIC_INTERFACE
  const loadSnippet = (snippet) => {
    setCode(snippet.code);
  };

  // PUBLIC_INTERFACE
  const deleteSnippet = (id) => {
    const updatedSnippets = savedSnippets.filter(s => s.id !== id);
    setSavedSnippets(updatedSnippets);
    localStorage.setItem('jsPlaygroundSnippets', JSON.stringify(updatedSnippets));
  };

  // PUBLIC_INTERFACE
  const shareCode = () => {
    const encodedCode = btoa(code);
    const shareUrl = `${window.location.origin}${window.location.pathname}?code=${encodedCode}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Share URL copied to clipboard!');
      }).catch(() => {
        prompt('Copy this URL to share your code:', shareUrl);
      });
    } else {
      prompt('Copy this URL to share your code:', shareUrl);
    }
  };

  // PUBLIC_INTERFACE
  const clearCode = () => {
    setCode('');
    setOutput('');
  };

  // Handle editor change
  const handleEditorChange = (value) => {
    setCode(value || '');
    
    // Basic syntax validation
    try {
      // eslint-disable-next-line no-new-func
      new Function(value || '');
      setSyntaxValid(true);
    } catch (e) {
      setSyntaxValid(false);
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true
    });
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded shadow-sm">
            <h1 className="h2 mb-0 text-primary fw-bold">
              <i className="bi bi-code-square me-2"></i>
              JavaScript Playground
            </h1>
            <div className="d-flex align-items-center">
              <div className="syntax-indicator me-3">
                <span className={`badge ${syntaxValid ? 'bg-success' : 'bg-danger'}`}>
                  {syntaxValid ? '✓ Valid Syntax' : '⚠ Syntax Error'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="row">
        {/* Editor Section */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-code me-2"></i>
                Code Editor
              </h5>
            </div>
            
            {/* Toolbar */}
            <div className="card-body p-3 bg-light border-bottom">
              <div className="btn-toolbar" role="toolbar">
                <div className="btn-group me-2" role="group">
                  <button 
                    className="btn btn-success" 
                    onClick={runCode} 
                    disabled={isRunning}
                  >
                    <i className="bi bi-play-fill me-1"></i>
                    {isRunning ? 'Running...' : 'Run'}
                  </button>
                </div>
                
                <div className="btn-group me-2" role="group">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setShowSaveDialog(true)}
                  >
                    <i className="bi bi-save me-1"></i>
                    Save
                  </button>
                  <button 
                    className="btn btn-info" 
                    onClick={shareCode}
                  >
                    <i className="bi bi-share me-1"></i>
                    Share
                  </button>
                </div>
                
                <div className="btn-group" role="group">
                  <button 
                    className="btn btn-outline-danger" 
                    onClick={clearCode}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="card-body p-0">
              <div className="editor-container">
                <Editor
                  height="450px"
                  defaultLanguage="javascript"
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="light"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow h-100">
            <div className="card-header bg-info text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-terminal me-2"></i>
                Output
              </h5>
            </div>
            <div className="card-body">
              <div className="output-container">
                <pre className={`output-content p-3 rounded ${output.includes('Error:') ? 'bg-danger-subtle text-danger' : 'bg-light'}`}>
                  {output || 'Click "Run" to execute your code and see the output here...'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Dialog Modal */}
      {showSaveDialog && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Save Snippet</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowSaveDialog(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="snippetName" className="form-label">Snippet Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="snippetName"
                    placeholder="Enter snippet name..."
                    value={snippetName}
                    onChange={(e) => setSnippetName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && saveSnippet()}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={saveSnippet}
                >
                  Save Snippet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Snippets */}
      {savedSnippets.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header bg-secondary text-white">
                <h5 className="card-title mb-0">
                  <i className="bi bi-collection me-2"></i>
                  Saved Snippets
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {savedSnippets.map(snippet => (
                    <div key={snippet.id} className="col-md-6 col-lg-4 mb-3">
                      <div className="card border-warning">
                        <div className="card-body">
                          <h6 className="card-title text-truncate">{snippet.name}</h6>
                          <p className="card-text text-muted small mb-3">
                            {new Date(snippet.createdAt).toLocaleDateString()}
                          </p>
                          <div className="btn-group w-100" role="group">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => loadSnippet(snippet)}
                            >
                              <i className="bi bi-upload me-1"></i>
                              Load
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteSnippet(snippet.id)}
                            >
                              <i className="bi bi-trash me-1"></i>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JavaScriptPlayground;
