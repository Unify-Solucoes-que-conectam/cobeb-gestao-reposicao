import { DataGrid, type ColumnDef } from '@/components/custom/data-grid';
import { Paginacao } from '@/components/custom/paginacao';
import SearchPanel from '@/components/custom/search-panel';
import { Button } from '@/components/ui/button';
import { useHeader } from '@/hooks/use-header';
import dayjs from '@/lib/dayjs';
import { downloadBlob } from '@/lib/utils';
import { MovimentoVendaTroca, trocaService } from '@/services/api.service';
import { DownloadIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ExportarTrocas from './components/exportar-trocas';

const operationLabels: Record<MovimentoVendaTroca['operacao'], string> = {
  '1': 'Venda', '2': 'Bonificação', '5': 'Troca', '39': 'Troca',
};

const toDate = (value: string): Date | undefined => {
  if (!value) return undefined;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.toDate() : undefined;
};

const toApiDate = (value: Date | undefined): string =>
  value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD') : '';

export default function AdminVendasTrocas() {
  const { setPageBreadcrumbs } = useHeader();
  const [rows, setRows] = useState<MovimentoVendaTroca[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, last_page: 1 });
  const [filters, setFilters] = useState({ search: '', dataInicial: '', dataFinal: '' });
  const [reloadKey, setReloadKey] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportDates, setExportDates] = useState({ inicial: '', final: '' });
  const [exporting, setExporting] = useState(false);

  useEffect(() => setPageBreadcrumbs([{ title: 'Vendas e Trocas', href: '/admin/vendas-trocas' }]), [setPageBreadcrumbs]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const result = await trocaService.read({
          page, per_page: perPage, search: filters.search || undefined,
          data_inicial: filters.dataInicial || undefined, data_final: filters.dataFinal || undefined,
        }, controller.signal);
        setRows(result.data);
        setPagination(result.pagination);
      } catch (error) {
        if (!controller.signal.aborted) toast.error('Não foi possível carregar os movimentos.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [page, perPage, filters, reloadKey]);

  const columns = useMemo<ColumnDef<MovimentoVendaTroca>[]>(() => [
    { id: 'data_operacao', header: 'Data', width: 120, renderCell: value => new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR') },
    { id: 'operacao', header: 'Operação', width: 140, renderCell: value => operationLabels[value as MovimentoVendaTroca['operacao']] },
    { id: 'cliente', header: 'Cliente', width: 280 },
    { id: 'nota', header: 'Nota', width: 130 },
    { id: 'produto_codigo', header: 'Cód. produto', width: 140 },
    { id: 'produto', header: 'Produto', width: 300 },
    { id: 'quantidade', header: 'Quantidade', width: 120 },
  ], []);

  const updateFilter = (key: keyof typeof filters, value: string) => { setFilters(current => ({ ...current, [key]: value })); setPage(1); };

  const exportTrades = async () => {
    if (!exportDates.inicial || !exportDates.final) return;
    try {
      setExporting(true);
      downloadBlob(await trocaService.exportar(exportDates.inicial, exportDates.final), `trocas_${exportDates.inicial}_${exportDates.final}.xlsx`);
      setExportOpen(false);
    } catch { toast.error('Não foi possível exportar as trocas.'); }
    finally { setExporting(false); }
  };

  return <div className="flex h-[calc(100dvh-var(--header-height)-6rem)] min-h-0 flex-col gap-6 overflow-hidden">
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">Vendas e Trocas</h1>
      <Button onClick={() => setExportOpen(true)}><DownloadIcon className="mr-2 h-4 w-4" />
        Exportar trocas
      </Button>
    </div>
    <SearchPanel
      className="shrink-0"
      placeholder="Pesquise por cliente, nota ou produto"
      search={filters.search}
      onSearchChange={value => updateFilter('search', value)}
      fetchData={() => setReloadKey(value => value + 1)}
      dateRange={{ initial: toDate(filters.dataInicial), final: toDate(filters.dataFinal) }}
      onDateRangeChange={range => {
        setFilters(current => ({ ...current, dataInicial: toApiDate(range.initial), dataFinal: toApiDate(range.final) }));
        setPage(1);
      }}
    />
    <div className="min-h-0 flex-1">
      <DataGrid
        data={rows}
        columns={columns}
        getRowId={row => `${row.origem}-${row.id}`}
        isLoading={loading}
        height="100%"
        emptyMessage="Nenhum movimento encontrado."
      />
    </div>
    <div className="shrink-0">
      <Paginacao
        page={page}
        pageSize={perPage}
        total={pagination.total}
        onPageChange={setPage}
        onPageSizeChange={size => { setPerPage(size); setPage(1); }}
      >
        {pagination.total} movimento(s) encontrado(s).
      </Paginacao>
    </div>
    <ExportarTrocas
      exportOpen={exportOpen}
      setExportOpen={setExportOpen}
      exportDates={exportDates}
      setExportDates={setExportDates}
      exporting={exporting}
      exportTrades={exportTrades}
    />
  </div>;
}
