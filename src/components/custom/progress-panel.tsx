import { useAuth } from '@/hooks/use-auth';
import useEcho from '@/hooks/use-echo';
import { useEffect, useState } from 'react';

type ImportBatch = {
  id: string;
  type: string;
  status: string;
  total_rows: number;
  processed_rows: number;
  percentage: number;
  last_log: string | null;
  current_step: string | null;
};

export function ImportProgressPanel() {
  const [imports, setImports] = useState<ImportBatch[]>([]);
  const { user, token } = useAuth();

  const echo = useEcho({
    channelName: user ? `notifications.${user.id}` : '',
    mode: 'event',
    eventName: 'appointment.created',
  })

  useEffect(() => {
    // Load running batches on page load
    fetch('/api/imports', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setImports(data.data ?? []));

    return () => {
      echo.disconnect();
    };
  }, [echo, token]);

  useEffect(() => {
    // Subscribe to each batch channel
    imports.forEach((batch) => {
      echo.private(`imports.${batch.id}`).listen('.import.progress.updated', (payload: ImportBatch) => {
        setImports((prev) =>
          prev.map((item) => (item.id === payload.id ? { ...item, ...payload } : item))
        );
      });
    });
  }, [echo, imports]);

  return (
    <div>
      {imports.map((batch) => (
        <div key={batch.id}>
          <strong>{batch.type}</strong>
          <div>{batch.percentage}%</div>
          <div>{batch.last_log}</div>
        </div>
      ))}
    </div>
  );
}