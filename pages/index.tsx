// pages/index.tsx
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { WebSocketProvider } from '../components/WebSocketProvider';
import ScriptRunner from '../components/ScriptRunner';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [websocketUrl, setWebsocketUrl] = useState('');

  useEffect(() => {
    // You can hardcode this for testing or use environment variables
    setWebsocketUrl(process.env.NEXT_PUBLIC_WEBSOCKET_URL || '');
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Interactive Script Runner</title>
        <meta name="description" content="Run scripts interactively via WebSocket" />
        
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Interactive Script Runner</h1>
        
        {websocketUrl ? (
          <WebSocketProvider>
            <ScriptRunner websocketUrl={websocketUrl} />
          </WebSocketProvider>
        ) : (
          <div className={styles.warning}>
            WebSocket URL not configured. Please set NEXT_PUBLIC_WEBSOCKET_URL in your environment variables.
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>AWS Code Runner WebSocket Interface</p>
      </footer>
    </div>
  );
}