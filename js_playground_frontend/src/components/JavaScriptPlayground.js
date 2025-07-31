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
    <div className="javascript-playground">
      <header className="playground-header">
        <h1>JavaScript Playground</h1>
        <div className="header-controls">
          <div className="syntax-indicator">
            <span className={`syntax-status ${syntaxValid ? 'valid' : 'invalid'}`}>
              {syntaxValid ? '✓ Valid Syntax' : '⚠ Syntax Error'}
            </span>
          </div>
        </div>
      </header>

      <div className="playground-content">
        <div className="editor-section">
          <div className="editor-toolbar">
            <button 
              className="btn btn-primary" 
              onClick={runCode} 
              disabled={isRunning}
            >
              {isRunning ? '⏳ Running...' : '▶️ Run'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowSaveDialog(true)}
            >
              💾 Save
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={shareCode}
            >
              📤 Share
            </button>
            <button 
              className="btn btn-danger" 
              onClick={clearCode}
            >
              🗑️ Clear
            </button>
          </div>

          <div className="editor-container">
            <Editor
              height="400px"
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

        <div className="output-section">
          <h3>Output</h3>
          <div className="output-container">
            <pre className={`output-content ${output.includes('Error:') ? 'error' : ''}`}>
              {output || 'Click "Run" to execute your code and see the output here...'}
            </pre>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Save Snippet</h3>
            <input
              type="text"
              placeholder="Enter snippet name..."
              value={snippetName}
              onChange={(e) => setSnippetName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && saveSnippet()}
            />
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={saveSnippet}>
                Save
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Snippets */}
      {savedSnippets.length > 0 && (
        <div className="saved-snippets">
          <h3>Saved Snippets</h3>
          <div className="snippets-grid">
            {savedSnippets.map(snippet => (
              <div key={snippet.id} className="snippet-card">
                <h4>{snippet.name}</h4>
                <p className="snippet-date">
                  {new Date(snippet.createdAt).toLocaleDateString()}
                </p>
                <div className="snippet-actions">
                  <button 
                    className="btn btn-small btn-primary"
                    onClick={() => loadSnippet(snippet)}
                  >
                    Load
                  </button>
                  <button 
                    className="btn btn-small btn-danger"
                    onClick={() => deleteSnippet(snippet.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default JavaScriptPlayground;
