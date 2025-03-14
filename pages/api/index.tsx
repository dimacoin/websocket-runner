// pages/index.tsx
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { WebSocketProvider } from '../../components/WebSocketProvider';
import ScriptRunner from '../../components/ScriptRunner';

export default function Home() {
  const [websocketUrl, setWebsocketUrl] = useState('');

  useEffect(() => {
    // You would get this URL from your environment or configuration
    // This is the WebSocket URL that was output by the CDK deployment
    setWebsocketUrl(process.env.NEXT_PUBLIC_WEBSOCKET_URL || '');
  }, []);

  return (
    <div>
      <Head>
        <title>Interactive Script Runner</title>
        <meta name="description" content="Run scripts interactively via WebSocket" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Interactive Script Runner</h1>
        
        {websocketUrl ? (
          <WebSocketProvider>
            <ScriptRunner websocketUrl={websocketUrl} />
          </WebSocketProvider>
        ) : (
          <div className="text-center p-4 bg-yellow-100 text-yellow-800 rounded">
            WebSocket URL not configured. Please set NEXT_PUBLIC_WEBSOCKET_URL in your environment.
          </div>
        )}
      </main>
    </div>
  );
}