import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define a type for WebSocket messages
interface WebSocketMessage {
  timestamp: string;
  data: string;
  parsed?: Record<string, unknown>;
}

interface WebSocketContextType {
  isConnected: boolean;
  connect: (url: string, executionId: string) => void;
  disconnect: () => void;
  sendMessage: (message: Record<string, unknown>) => boolean;
  output: {
    stdout: string[];
    stderr: string[];
  };
  sendInput: (input: string) => boolean;
  status: { type: string; message: string };
  inputPrompt: string | null;
  messageHistory: WebSocketMessage[]; // Add message history to the context
  clearMessageHistory: () => void; // Add function to clear message history
  clearOutput: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [executionId, setExecutionId] = useState('');
  const [output, setOutput] = useState<{ stdout: string[]; stderr: string[] }>({
    stdout: [],
    stderr: [],
  });
  const [status, setStatus] = useState<{ type: string; message: string }>({
    type: 'info',
    message: 'Not connected'
  });
  const [inputPrompt, setInputPrompt] = useState<string | null>(null);
  const [messageHistory, setMessageHistory] = useState<WebSocketMessage[]>([]);

  const clearMessageHistory = () => {
    setMessageHistory([]);
  };


  // Add function to clear output
  const clearOutput = () => {
    setOutput({
      stdout: [],
      stderr: []
    });
  };

  const connect = (url: string, execId: string) => {
    if (socket) {
      socket.close();
    }

    try {
      setExecutionId(execId);
      // Provide both execution_id and role as query parameters.
      // Here the role is hardcoded as 'frontend'; adjust if needed.
      const role = 'frontend';
      const ws = new WebSocket(`${url}?execution_id=${execId}&role=${role}`);

      ws.onopen = () => {
        setIsConnected(true);
        setStatus({ type: 'success', message: 'Connected to WebSocket server' });
        console.log('WebSocket connection established');
        console.log('Connected to:', ws.url);
      };

      ws.onmessage = (event) => {
        console.log('RAW MESSAGE RECEIVED:', event.data);

        // If there's no data or it's just empty string, skip
        if (!event.data) {
          return;
        }

        // Add message to history
        const newMessage: WebSocketMessage = {
          timestamp: new Date().toISOString(),
          data: event.data
        };

        try {
          const parsedData = JSON.parse(event.data);
          newMessage.parsed = parsedData;
          console.log('WebSocket message received:', parsedData);

          // Add to message history
          setMessageHistory(prev => [...prev, newMessage]);

          const actualMessage = parsedData.originalMessage || parsedData;

          // Only process messages for our execution ID
          if (actualMessage.execution_id !== execId) {
            return;
          }

          switch (actualMessage.type) {
            case 'output':
              if (parsedData.event === 'stdout') {
                setOutput((prev) => ({
                  ...prev,
                  stdout: [...prev.stdout, parsedData.data.line],
                }));
              } else if (parsedData.event === 'stderr') {
                setOutput((prev) => ({
                  ...prev,
                  stderr: [...prev.stderr, parsedData.data.line],
                }));
              }
              break;

            case 'status':
              if (parsedData.event === 'input_required') {
                console.log('Received input_required -> Setting inputPrompt');
                setInputPrompt(parsedData.data.prompt || 'Input required:');
              } else if (parsedData.event === 'input_received') {
                setInputPrompt(null);
              } else {
                setStatus({
                  type: 'info',
                  message: `${parsedData.event}: ${JSON.stringify(parsedData.data)}`
                });
              }
              break;

            default:
              console.log('Unknown message type:', parsedData.type);
          }
        } catch (error) {
          // If parsing fails, still add the raw message to history
          setMessageHistory(prev => [...prev, newMessage]);
          console.error('Error processing WebSocket message:', error);
          return;
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus({ type: 'error', message: 'WebSocket error occurred' });
      };

      ws.onclose = () => {
        setIsConnected(false);
        setStatus({ type: 'warning', message: 'Disconnected from WebSocket server' });
        console.log('WebSocket connection closed');
      };

      setSocket(ws);
      return true;
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setStatus({ type: 'error', message: `Connection error: ${error}` });
      return false;
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  const sendMessage = (message: Record<string, unknown>) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      socket.send(JSON.stringify({
        ...message,
        execution_id: executionId,
        timestamp: new Date().toISOString()
      }));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  };

  const sendInput = (input: string) => {
    console.log('Sending input:', input);
    return sendMessage({
      action: 'sendmessage',
      type: 'input',
      execution_id: executionId,
      event: 'user_input',
      role: 'frontend',
      data: { text: input }
    });
  };

  // Clean up WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        connect,
        disconnect,
        sendMessage,
        output,
        sendInput,
        status,
        inputPrompt,
        messageHistory,
        clearMessageHistory,
        clearOutput
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
