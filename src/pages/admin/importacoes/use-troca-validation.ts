import { useEffect, useMemo, useState } from 'react';
import axios from '@/lib/axios';
import type { ImportOptions } from '@/components/custom/data-importer';

export type TrocaValidation = {
  row_index: number;
  status: 'valid' | 'ignored' | 'error' | 'confirmation';
  message: string;
  disponivel?: number;
  aprovada?: number;
  correcoes?: number;
  confirmation_token?: string;
};

export function useTrocaValidation(enabled: boolean, rows: Record<string, string>[], selected: Set<string | number>, options: ImportOptions | null, revision: number) {
  const payload = useMemo(() => rows.map((row, index) => ({ row, index })).filter(({ index }) => selected.has(index)), [rows, selected]);
  const key = JSON.stringify({ payload, action: options?.duplicateAction ?? 'ignore', revision });
  const [state, setState] = useState<{ key: string; results: TrocaValidation[]; error: string }>({ key: '', results: [], error: '' });
  const [retry, setRetry] = useState(0);
  const active = enabled && payload.some(({ row }) => ['5', '39'].includes(String(row.operacao).trim()));

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await axios.post('/importar/validar-trocas', { records: payload.map(({ row }) => row), options }, { signal: controller.signal });
        if (controller.signal.aborted) return;
        if (!response.data.success || !Array.isArray(response.data.data)) throw new Error(response.data.message || 'Não foi possível validar as trocas.');
        setState({ key, error: '', results: response.data.data.map((result: TrocaValidation) => ({ ...result, row_index: payload[result.row_index].index })) });
      } catch (error) {
        if (!controller.signal.aborted) setState({ key, results: [], error: error instanceof Error ? error.message : 'Erro ao consultar saldos.' });
      }
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [active, key, retry]);

  const pending = active && state.key !== key;
  const results = active && !pending ? state.results : [];
  const error = active && !pending ? state.error : '';
  return { results, pending, error, blocked: pending || !!error || results.some(row => ['error', 'confirmation'].includes(row.status)),
    retry: () => { setState({ key: '', results: [], error: '' }); setRetry(value => value + 1); } };
}
