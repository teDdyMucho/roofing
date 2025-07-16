import React, { useState, useEffect } from 'react';
import './DebugPanel.css';

interface DebugPanelProps {
  isVisible: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Intercept console logs
  useEffect(() => {
    if (!isVisible) return;
    
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // Override console methods to capture logs
    console.log = (...args) => {
      originalConsoleLog(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prevLogs => [...prevLogs, `[LOG] ${message}`]);
    };
    
    console.error = (...args) => {
      originalConsoleError(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prevLogs => [...prevLogs, `[ERROR] ${message}`]);
    };
    
    console.warn = (...args) => {
      originalConsoleWarn(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prevLogs => [...prevLogs, `[WARN] ${message}`]);
    };
    
    // Restore original console methods on cleanup
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, [isVisible]);
  
  // Network request monitoring
  useEffect(() => {
    if (!isVisible) return;
    
    const originalFetch = window.fetch;
    
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      const startTime = performance.now();
      setLogs(prevLogs => [...prevLogs, `[FETCH] Request to ${url}`]);
      
      try {
        const response = await originalFetch(input, init);
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        
        // Clone the response to read its body
        const responseClone = response.clone();
        
        setLogs(prevLogs => [
          ...prevLogs, 
          `[FETCH] Response from ${url} - Status: ${response.status} (${duration}ms)`
        ]);
        
        // Try to log response body for JSON responses
        if (responseClone.headers.get('content-type')?.includes('application/json')) {
          try {
            const data = await responseClone.json();
            setLogs(prevLogs => [
              ...prevLogs, 
              `[FETCH] Response data: ${JSON.stringify(data, null, 2).substring(0, 500)}${JSON.stringify(data, null, 2).length > 500 ? '...' : ''}`
            ]);
          } catch (e) {
            // Silently fail if we can't parse the JSON
          }
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(2);
        
        setLogs(prevLogs => [
          ...prevLogs, 
          `[FETCH] Error for ${url} - ${error instanceof Error ? error.message : 'Unknown error'} (${duration}ms)`
        ]);
        
        throw error;
      }
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  return (
    <div className={`debug-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="debug-panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        Debug Panel {isExpanded ? '▼' : '▲'}
        <button 
          className="clear-logs-button"
          onClick={(e) => {
            e.stopPropagation();
            setLogs([]);
          }}
        >
          Clear
        </button>
      </div>
      
      {isExpanded && (
        <div className="debug-panel-content">
          <div className="debug-logs">
            {logs.length === 0 ? (
              <div className="no-logs">No logs yet. Try uploading a document.</div>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`log-entry ${log.includes('[ERROR]') ? 'error' : log.includes('[WARN]') ? 'warning' : ''}`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
