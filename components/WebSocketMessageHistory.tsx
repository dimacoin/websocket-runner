import React, { useState } from 'react';
import { useWebSocket } from './WebSocketProvider';

const WebSocketMessageHistory: React.FC = () => {
  const { messageHistory, clearMessageHistory } = useWebSocket();
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedMessage(expandedMessage === index ? null : index);
  };

  const formatJson = (json: unknown): string => {
    try {
      return JSON.stringify(json, null, 2);
    } catch {
      return String(json);
    }
  };

  return (
    <div className="websocket-message-history">
      <div className="history-header">
        <h3>WebSocket Message History ({messageHistory.length} messages)</h3>
        <button 
          onClick={clearMessageHistory}
          className="clear-button"
          disabled={messageHistory.length === 0}
        >
          Clear History
        </button>
      </div>

      {messageHistory.length === 0 ? (
        <div className="no-messages">No messages received yet</div>
      ) : (
        <div className="message-list">
          {messageHistory.map((message, index) => (
            <div 
              key={`${message.timestamp}-${index}`} 
              className="message-item"
              onClick={() => toggleExpand(index)}
            >
              <div className="message-header">
                <span className="message-index">#{index + 1}</span>
                <span className="message-timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
                <span className="expand-indicator">{expandedMessage === index ? '▼' : '▶'}</span>
              </div>
              
              {expandedMessage === index && (
                <div className="message-details">
                  <div className="message-raw">
                    <h5>Raw Data:</h5>
                    <pre>{message.data}</pre>
                  </div>
                  
                  {message.parsed && (
                    <div className="message-parsed">
                      <h5>Parsed Data:</h5>
                      <pre>{formatJson(message.parsed)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .websocket-message-history {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .clear-button {
          padding: 5px 10px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .clear-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        
        .no-messages {
          padding: 20px;
          text-align: center;
          color: #666;
          font-style: italic;
        }
        
        .message-list {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .message-item {
          margin-bottom: 8px;
          border: 1px solid #eee;
          border-radius: 4px;
          background-color: white;
          cursor: pointer;
        }
        
        .message-header {
          padding: 8px 12px;
          display: flex;
          justify-content: space-between;
          background-color: #f5f5f5;
          border-radius: 3px 3px 0 0;
        }
        
        .message-index {
          font-weight: bold;
          color: #333;
        }
        
        .message-timestamp {
          color: #666;
        }
        
        .expand-indicator {
          color: #888;
        }
        
        .message-details {
          padding: 10px;
          border-top: 1px solid #eee;
        }
        
        .message-raw, .message-parsed {
          margin-bottom: 10px;
        }
        
        .message-raw h5, .message-parsed h5 {
          margin-bottom: 5px;
          color: #555;
        }
        
        pre {
          background-color: #f0f0f0;
          padding: 10px;
          border-radius: 3px;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
          font-family: monospace;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default WebSocketMessageHistory; 