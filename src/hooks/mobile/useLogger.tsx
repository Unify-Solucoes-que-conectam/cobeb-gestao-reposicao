// src/hooks/useLogger.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

interface LogEntry {
  id: number;
  message: string;
  type: 'info' | 'error' | 'success';
  timestamp: string;
}

interface LogContextType {
  logs: LogEntry[];
  addLog: (message: string, type?: 'info' | 'error' | 'success') => void;
  clearLogs: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export const LogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setLogs((prev) => [
      {
        id: Date.now(),
        message,
        type,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 49), // Mantém apenas os últimos 50 logs
    ]);
  }, []);

  const clearLogs = () => setLogs([]);

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLogger = () => {
  const context = useContext(LogContext);
  if (!context) throw new Error('useLogger deve ser usado dentro de um LogProvider');
  return context;
};