// src/components/LogTerminal.tsx
import { useLogger } from '@/hooks/mobile/useLogger';
import React from 'react';

export const LogTerminal: React.FC = () => {
  const { logs } = useLogger();

  return (
    <div style={{
      background: '#1a1a1a',
      color: '#00ff00',
      padding: '10px',
      fontFamily: 'monospace',
      fontSize: '12px',
      height: '150px',
      overflowY: 'auto',
      borderTop: '2px solid #333'
    }}>
      {logs.map((log) => (
        <div key={log.id} style={{ marginBottom: '4px', borderBottom: '1px solid #222' }}>
          <span style={{ color: '#888' }}>[{log.timestamp}]</span>{' '}
          <span style={{ color: log.type === 'error' ? '#ff4444' : log.type === 'success' ? '#44ff44' : '#00ff00' }}>
            {log.message}
          </span>
        </div>
      ))}
    </div>
  );
};