// pages/websocket-test.tsx
import React, { useState } from 'react';
import WebSocketMonitor from '../components/WebSocketMonitor';
import WebSocketMessageHistory from '../components/WebSocketMessageHistory';
import { useWebSocket } from '../components/WebSocketProvider';

const WebSocketTest: React.FC = () => {
  const [wsUrl, setWsUrl] = useState('ws://localhost:3000');
  const [execId, setExecId] = useState('test-' + Date.now());
  const { isConnected, connect, disconnect } = useWebSocket();

  const handleConnect = () => {
    connect(wsUrl, execId);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="websocket-test-container">
      <h1>WebSocket Test Page</h1>
      
      <div className="connection-controls">
        <div className="input-group">
          <label>WebSocket URL:</label>
          <input 
            type="text" 
            value={wsUrl} 
            onChange={(e) => setWsUrl(e.target.value)}
          />
        </div>
        
        <div className="input-group">
          <label>Execution ID:</label>
          <input 
            type="text" 
            value={execId} 
            onChange={(e) => setExecId(e.target.value)}
          />
        </div>
        
        <div className="button-group">
          <button 
            className="connect-button"
            onClick={handleConnect}
            disabled={isConnected}
          >
            Connect
          </button>
          
          <button 
            className="disconnect-button"
            onClick={handleDisconnect}
            disabled={!isConnected}
          >
            Disconnect
          </button>
        </div>
      </div>
      
      <WebSocketMonitor />
      
      <WebSocketMessageHistory />
      
      <style jsx>{`
        .websocket-test-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        h1 {
          color: #333;
          margin-bottom: 20px;
        }
        
        .connection-controls {
          background-color: #f5f5f5;
          padding: 20px;
          border-radius: 5px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
        }
        
        .input-group label {
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        .input-group input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .button-group {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        
        button {
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          color: white;
          font-weight: bold;
          cursor: pointer;
        }
        
        button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        
        .connect-button {
          background-color: #4CAF50;
        }
        
        .disconnect-button {
          background-color: #f44336;
        }
      `}</style>
    </div>
  );
};

export default WebSocketTest; 