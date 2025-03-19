// components/ScriptRunner.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useWebSocket } from './WebSocketProvider';
import styles from './ScriptRunner.module.css';

interface ScriptRunnerProps {
  websocketUrl: string;
}

const ScriptRunner: React.FC<ScriptRunnerProps> = ({ websocketUrl }) => {
  const { 
    isConnected, 
    connect, 
    disconnect, 
    output, 
    status, 
    inputPrompt, 
    sendInput, 
    clearOutput
  } = useWebSocket();
  
  const [scriptKey, setScriptKey] = useState('test_scripts/example_from_task_2.py');

  //const [executionId, setExecutionId] = useState(`interactive-${Date.now()}`);
  const [executionId, setExecutionId] = useState('');
  
  const [userInput, setUserInput] = useState('');
  const consoleRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll console to bottom when output changes
//   useEffect(() => {
//     if (consoleRef.current) {
//       consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
//     }
//   }, [output]);

//useEffect(() => {
    // Debug only - direct WebSocket connection for monitoring
    // if (websocketUrl) {
    //   console.log('Setting up debug WebSocket connection to:', websocketUrl);
      
    //   const wsDebugHandler = (event: unknown) => {
    //     console.log('WebSocket event:', event.type, event);
    //     if (event.type === 'message' && event.data) {
    //       try {
    //         const data = JSON.parse(event.data);
    //         console.log('Parsed WebSocket message:', data);
    //       } catch (error) {
    //         console.log('Raw WebSocket message data:', event.data);
    //         console.log(`Error: ${error}`);
    //       }
    //     }
    //   };
      
      // Create a separate WebSocket just for debugging
    //   try {
    //     const debugWs = new WebSocket(`${websocketUrl}?debug=true&execution_id=${executionId}`);
    //     debugWs.addEventListener('open', wsDebugHandler);
    //     debugWs.addEventListener('message', wsDebugHandler);
    //     debugWs.addEventListener('close', wsDebugHandler);
    //     debugWs.addEventListener('error', wsDebugHandler);
        
    //     console.log('Debug WebSocket initialized');
        
    //     return () => {
    //       console.log('Closing debug WebSocket');
    //       debugWs.close();
    //     };
    //   } catch (error) {
    //     console.error('Error setting up debug WebSocket:', error);
    //   }
    //}
  //}, [websocketUrl, executionId]);
  
  // Auto-scroll console to bottom when output changes
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [output]);



//////////////////////////////////

  
  const startScript = async () => {

    // generate a UUID
    const newExecId = crypto.randomUUID();
    setExecutionId(newExecId);

    // Clear the console output before starting new script
    clearOutput();  // This line is new

    // First, establish WebSocket connection
    connect(websocketUrl, newExecId);
    
    // Then, send SQS message to start the script
    try {
      const response = await fetch('/api/run-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          s3_key: scriptKey,
          output_destination: 'websocket',
          output_config: {
            websocket_url: websocketUrl,
            client_id: 'frontend-client'
          },
          execution_id: newExecId,
          jwtToken: 'jwt3213211232312436512436151433241'
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        alert(`Failed to start script: ${result.error}`);
      }
    } catch (error) {
      console.error('Error starting script:', error);
      alert(`Error starting script: ${error}`);
    }
  };
  
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      sendInput(userInput);
      setUserInput('');
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.controlPanel}>
        <div className={styles.inputGroup}>
          <div className={styles.formGroup}>
            <label htmlFor="script-key">Script S3 Key:</label>
            <input
              id="script-key"
              type="text"
              value={scriptKey}
              onChange={(e) => setScriptKey(e.target.value)}
              placeholder="test_scripts/example.py"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="execution-id">Execution ID:</label>
            <input
              id="execution-id"
              type="text"
              value={executionId}
              onChange={(e) => setExecutionId(e.target.value)}
              placeholder="interactive-123"
            />
          </div>
        </div>
        
        <div className={styles.buttonGroup}>
          <button
            onClick={startScript}
            disabled={isConnected}
            className={isConnected ? styles.buttonDisabled : styles.buttonPrimary}
          >
            Run Script
          </button>
          <button
            onClick={disconnect}
            disabled={!isConnected}
            className={!isConnected ? styles.buttonDisabled : styles.buttonDanger}
          >
            Disconnect
          </button>
        </div>
      </div>
      
      <div className={styles.statusBar}>
        <span>Status:</span>
        <span className={
          status.type === 'error' 
            ? styles.statusError
            : status.type === 'success' 
              ? styles.statusSuccess
              : status.type === 'warning' 
                ? styles.statusWarning
                : styles.statusInfo
        }>
          {status.message}
        </span>
        {isConnected && (
          <span className={styles.connectionStatus}>
            <span className={styles.connectionDot}></span>
            Connected
          </span>
        )}
      </div>
      
      <div 
        ref={consoleRef}
        className={styles.consoleOutput}
      >
        {output.stdout.map((line, i) => (
          <div key={`stdout-${i}`} className={styles.stdoutLine}>
            {line}
          </div>
        ))}
        {output.stderr.map((line, i) => (
          <div key={`stderr-${i}`} className={styles.stderrLine}>
            {line}
          </div>
        ))}
      </div>
      
      <form 
        onSubmit={handleInputSubmit}
        className={styles.inputForm}
      >
        <input
          type="text"
          className={styles.inputField}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={inputPrompt || "Type your input here..."}
          disabled={!inputPrompt}
        />
        <button
          type="submit"
          className={inputPrompt ? styles.buttonSend : styles.buttonSendDisabled}
          disabled={!inputPrompt}
        >
          Send
        </button>
      </form>
      
      {inputPrompt && (
        <div className={styles.inputPrompt}>
          {inputPrompt}
        </div>
      )}
    </div>
  );
};

export default ScriptRunner;