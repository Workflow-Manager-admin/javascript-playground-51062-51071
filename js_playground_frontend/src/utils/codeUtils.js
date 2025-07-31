// PUBLIC_INTERFACE
/**
 * Safely executes JavaScript code with limited global access
 * @param {string} code - The JavaScript code to execute
 * @param {object} customConsole - Custom console object for capturing output
 * @returns {Promise} Promise that resolves when code execution is complete
 */
export function executeCode(code, customConsole) {
  return new Promise((resolve, reject) => {
    try {
      const safeEval = new Function(
        'console',
        'setTimeout',
        'setInterval',
        'clearTimeout',
        'clearInterval',
        'fetch',
        'XMLHttpRequest',
        `
        try {
          ${code}
          return 'success';
        } catch (error) {
          console.error('Runtime Error:', error.message);
          return 'error';
        }
        `
      );

      const result = safeEval(
        customConsole,
        () => customConsole.warn('setTimeout is disabled for security'),
        () => customConsole.warn('setInterval is disabled for security'),
        () => {},
        () => {},
        undefined, // Disable fetch
        undefined  // Disable XMLHttpRequest
      );

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// PUBLIC_INTERFACE
/**
 * Validates JavaScript syntax
 * @param {string} code - The code to validate
 * @returns {object} Object with isValid boolean and error message if invalid
 */
export function validateSyntax(code) {
  try {
    new Function(code);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
}

// PUBLIC_INTERFACE
/**
 * Formats code output for display
 * @param {any} value - The value to format
 * @returns {string} Formatted string representation
 */
export function formatOutput(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'function') return value.toString();
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return String(value);
    }
  }
  return String(value);
}

// PUBLIC_INTERFACE
/**
 * Encodes code for URL sharing
 * @param {string} code - The code to encode
 * @returns {string} Base64 encoded code
 */
export function encodeCodeForUrl(code) {
  try {
    return btoa(encodeURIComponent(code));
  } catch (error) {
    console.error('Failed to encode code:', error);
    return '';
  }
}

// PUBLIC_INTERFACE
/**
 * Decodes code from URL
 * @param {string} encodedCode - The base64 encoded code
 * @returns {string} Decoded code
 */
export function decodeCodeFromUrl(encodedCode) {
  try {
    return decodeURIComponent(atob(encodedCode));
  } catch (error) {
    console.error('Failed to decode code:', error);
    return '';
  }
}
