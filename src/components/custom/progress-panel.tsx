import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import useEcho from '@/hooks/use-echo';
import dayjs from '@/lib/dayjs';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ImportBatch = {
  id: string;
  type: string;
  status: string;
  total_rows: number;
  processed_rows: number;
  percentage: number;
  last_log: string | null;
  current_step: string | null;
  updated_at: string;
};

type ImportProgressPanelProps = {
  batchId?: string | null;
  initialBatch?: ImportBatch | null;
  onUpdate?: (batch: ImportBatch) => void;
};

export function ImportProgressPanel({ batchId, initialBatch, onUpdate }: ImportProgressPanelProps) {
  const [batch, setBatch] = useState<ImportBatch | null>(initialBatch ?? null);

  const { messages, disconnect } = useEcho({
    channelName: batchId ? `imports.${batchId}` : '',
    mode: 'event',
    eventName: 'import.progress.updated',
    isPrivate: true,
  });

  useEffect(() => {
    setBatch(initialBatch ?? null);
  }, [initialBatch]);

  useEffect(() => {
    if (!messages.length) return;
    const latest = messages[messages.length - 1] as unknown as ImportBatch;
    setBatch(latest);
    onUpdate?.(latest);
  }, [messages, onUpdate]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  if (!batch) return null;

  const isCompleted = batch.status === 'completed';
  const isFailed = batch.status === 'failed';
  const isActive = batch.status === 'pending' || batch.status === 'processing';

  const statusLabel = {
    pending: 'Pendente',
    processing: 'Processando',
    completed: 'Concluído',
    failed: 'Falhou',
  }[batch.status] ?? batch.status;

  const statusVariant = isCompleted ? 'default' : isFailed ? 'destructive' : 'secondary';

  return (
    <div className={`text-xs space-y-2 p-3 rounded-md border ${isCompleted ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' : isFailed ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' : 'bg-muted border-transparent'}`}>
      <div className="flex items-center gap-2 flex-wrap">
        {isActive && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
        {isFailed && <XCircle className="h-3.5 w-3.5 text-red-600" />}
        <Badge variant={statusVariant} className="text-xs">{statusLabel}</Badge>
        <span className="text-muted-foreground ml-auto">
          {batch.processed_rows}/{batch.total_rows} registros
        </span>
      </div>
      {(isActive || batch.percentage > 0) && (
        <Progress value={batch.percentage} className="h-1.5" />
      )}
      <div className="flex justify-between items-center gap-3">
        {batch.last_log && (
          <p className="text-muted-foreground truncate" title={batch.last_log}>{batch.last_log}</p>
        )}
        {
          batch.updated_at && (
            <p className="text-muted-foreground text-xs truncate" title={`Última importação: ${dayjs(batch.updated_at).format('DD/MM/YYYY HH:mm:ss')}`}>
              Última importação: {dayjs(batch.updated_at).format('DD/MM/YYYY HH:mm:ss')}
            </p>
          )
        }
      </div>
    </div>
  );
}