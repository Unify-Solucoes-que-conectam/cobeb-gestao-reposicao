import type { ColumnDef } from '@/components/custom/data-grid';
import { ListPage } from '@/components/custom/list-page';
import SearchPanel from '@/components/custom/search-panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/hooks/use-header';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
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
  const { can } = useAuth();
  const [exportOpen, setExportOpen] = useState(false);
  const [exportDates, setExportDates] = useState({ inicial: '', final: '' });
  const [exporting, setExporting] = useState(false);

  useEffect(() => setPageBreadcrumbs([{ title: 'Vendas e Trocas', href: '/admin/vendas-trocas' }]), [setPageBreadcrumbs]);

  // consulta paginada: o texto só é pesquisado ao clicar na lupa ou apertar Enter; as datas aplicam na hora
  const consulta = usePaginatedQuery<MovimentoVendaTroca, { dataInicial: string; dataFinal: string }>(
    ({ search, page, per_page, dataInicial, dataFinal }, signal) => trocaService.read({
      page, per_page, search,
      data_inicial: dataInicial || undefined, data_final: dataFinal || undefined,
    }, signal),
    { dataInicial: '', dataFinal: '' },
    { errorMessage: 'Não foi possível carregar os movimentos.' },
  );

  const columns = useMemo<ColumnDef<MovimentoVendaTroca>[]>(() => [
    { id: 'data_operacao', header: 'Data', width: 120, renderCell: value => new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR') },
    { id: 'operacao', header: 'Operação', width: 140, renderCell: value => operationLabels[value as MovimentoVendaTroca['operacao']] },
    { id: 'cliente', header: 'Cliente', width: 280 },
    { id: 'nota', header: 'Nota', width: 130 },
    { id: 'produto_codigo', header: 'Cód. produto', width: 140 },
    { id: 'produto', header: 'Produto', width: 300 },
    { id: 'quantidade', header: 'Quantidade', width: 120 },
  ], []);

  const exportTrades = async () => {
    if (!exportDates.inicial || !exportDates.final) return;
    try {
      setExporting(true);
      downloadBlob(await trocaService.exportar(exportDates.inicial, exportDates.final), `trocas_${exportDates.inicial}_${exportDates.final}.xlsx`);
      setExportOpen(false);
    } catch { toast.error('Não foi possível exportar as trocas.'); }
    finally { setExporting(false); }
  };

  return (
    <>
      <ListPage
        title="Vendas e Trocas"
        actions={can('trocas.exportar') && (
          <Button onClick={() => setExportOpen(true)}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Exportar trocas
          </Button>
        )}
        search={
          <SearchPanel
            placeholder="Pesquise por cliente, nota ou produto"
            search={consulta.busca}
            onSearchChange={consulta.setBusca}
            fetchData={consulta.pesquisar}
            dateRange={{ initial: toDate(consulta.filters.dataInicial), final: toDate(consulta.filters.dataFinal) }}
            onDateRangeChange={range => {
              consulta.setFilter('dataInicial', toApiDate(range.initial));
              consulta.setFilter('dataFinal', toApiDate(range.final));
            }}
          />
        }
        columns={columns}
        data={consulta.items}
        getRowId={row => `${row.origem}-${row.id}`}
        loading={consulta.loading}
        emptyMessage="Nenhum movimento encontrado."
        pagination={{
          page: consulta.page,
          pageSize: consulta.perPage,
          total: consulta.total,
          onPageChange: consulta.setPage,
          onPageSizeChange: consulta.setPerPage,
          label: `${consulta.total} movimento(s) encontrado(s).`,
        }}
      />
      <ExportarTrocas
        exportOpen={exportOpen}
        setExportOpen={setExportOpen}
        exportDates={exportDates}
        setExportDates={setExportDates}
        exporting={exporting}
        exportTrades={exportTrades}
      />
    </>
  );
}
