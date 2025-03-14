// components/WebSocketMonitor.tsx
import React from 'react';
import { useWebSocket } from './WebSocketProvider';

const WebSocketMonitor: React.FC = () => {
  const { 
    isConnected, 
    output, 
    status, 
    inputPrompt 
  } = useWebSocket();

  return (
    <div className="websocket-monitor">
      <h3>WebSocket Status</h3>
      <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      
      <div className="status-message">
        <strong>Status:</strong> <span className={`status-${status.type}`}>{status.message}</span>
      </div>
      
      {inputPrompt && (
        <div className="input-prompt">
          <strong>Input Prompt:</strong> {inputPrompt}
        </div>
      )}
      
      <div className="messages-container">
        <h4>Messages Received</h4>
        
        <div className="output-section">
          <h5>stdout ({output.stdout.length} messages)</h5>
          <pre className="output stdout">
            {output.stdout.join('\n')}
          </pre>
        </div>
        
        <div className="output-section">
          <h5>stderr ({output.stderr.length} messages)</h5>
          <pre className="output stderr">
            {output.stderr.join('\n')}
          </pre>
        </div>
      </div>
      
      <style jsx>{`
        .websocket-monitor {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        
        .status-indicator {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 3px;
          font-weight: bold;
          color: white;
          margin-bottom: 10px;
        }
        
        .connected {
          background-color: green;
        }
        
        .disconnected {
          background-color: red;
        }
        
        .status-success {
          color: green;
        }
        
        .status-error {
          color: red;
        }
        
        .status-warning {
          color: orange;
        }
        
        .status-info {
          color: blue;
        }
        
        .messages-container {
          margin-top: 15px;
        }
        
        .output-section {
          margin-bottom: 15px;
        }
        
        .output {
          max-height: 200px;
          overflow-y: auto;
          background-color: #f0f0f0;
          padding: 10px;
          border-radius: 3px;
          white-space: pre-wrap;
          word-break: break-all;
        }
        
        .stdout {
          border-left: 3px solid blue;
        }
        
        .stderr {
          border-left: 3px solid red;
        }
        
        .input-prompt {
          margin: 10px 0;
          padding: 8px;
          background-color: #fffde7;
          border-left: 3px solid #fdd835;
        }
      `}</style>
    </div>
  );
};

export default WebSocketMonitor; 