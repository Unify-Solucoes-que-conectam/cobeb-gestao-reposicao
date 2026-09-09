import { DataGrid } from "@/components/custom/data-grid";
import type { ImportOptions } from "@/components/custom/data-importer";
import { DatePicker } from "@/components/custom/date-picker";
import { Paginacao } from "@/components/custom/paginacao";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, UploadIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ImporterConfig } from "../config";
import { getImportDuplicateKey } from "../duplicate-rows";
import { useTrocaValidation, type TrocaValidation } from "../use-troca-validation";
import dayjs from "@/lib/dayjs";

interface ImportPreviewDialogProps {
  config: ImporterConfig;
  rows: Record<string, string>[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (selectedRows: Record<string, string>[]) => void;
  importing: boolean;
  options: ImportOptions | null;
  validationRevision: number;
}

type IndexedRow = Record<string, string | number>;

export function ImportPreviewDialog({
  config,
  rows,
  open,
  onOpenChange,
  onImport,
  importing,
  options,
  validationRevision,
}: ImportPreviewDialogProps) {
  const [renderedRows, setRenderedRows] = useState<Record<string, string>[]>(rows);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [page, setPage] = useState(1);
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [depsOptions, setDepsOptions] = useState<Record<string, any>>({});
  const [loadingDeps, setLoadingDeps] = useState(true);

  // Estado para controlar o modal de edição de linha
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Record<string, string>>({});
  const [correction, setCorrection] = useState<TrocaValidation | null>(null);
  const tradeValidation = useTrocaValidation(open && config.key === 'vendas_trocas', renderedRows, selectedRows, options, validationRevision);
  const tradeResults = useMemo(() => new Map(tradeValidation.results.map(result => [result.row_index, result])), [tradeValidation.results]);

  // Reseta os dados e a seleção apenas ao abrir o modal
  useEffect(() => {
    if (open) {
      setRenderedRows(rows);
      setSelectedRows(new Set(rows.map((_, i) => i)));
      setPage(1);
      setDuplicatesOnly(false);
      setConfirmOpen(false);
      setEditingRowIndex(null);
      setCorrection(null);
    }
  }, [open, rows]);

  const indexedRows: IndexedRow[] = useMemo(
    () => renderedRows.map((row, i) => ({ ...row, _rowIndex: i })),
    [renderedRows]
  );

  const duplicateIndexes = useMemo(() => {
    const groups = new Map<string, number[]>();
    renderedRows.forEach((row, index) => {
      if (!selectedRows.has(index)) return;
      const key = getImportDuplicateKey(config.key, row);
      if (key === null) return;
      const group = groups.get(key);
      if (group) group.push(index);
      else groups.set(key, [index]);
    });
    return new Set([...groups.values()].filter(group => group.length > 1).flat());
  }, [renderedRows, selectedRows, config.key]);
  const hasDuplicates = duplicateIndexes.size > 0;
  const visibleRows = useMemo(
    () => duplicatesOnly ? indexedRows.filter(row => duplicateIndexes.has(Number(row._rowIndex))) : indexedRows,
    [indexedRows, duplicateIndexes, duplicatesOnly]
  );
  const currentPage = Math.min(page, Math.max(1, Math.ceil(visibleRows.length / pageSize)));
  const pageStart = (currentPage - 1) * pageSize;
  const pageIndexedRows = useMemo(
    () => visibleRows.slice(pageStart, pageStart + pageSize),
    [visibleRows, pageStart, pageSize]
  );

  const handleConfirm = () => {
    if (selectedRows.size === 0 || importing || hasRequiredFields || hasDuplicates || tradeValidation.blocked) return;
    const filteredRows = renderedRows
      .filter((_, i) => selectedRows.has(i))
      .map((row) => {
        const filteredRow: Record<string, string> = {};

        for (const col of config.columns) {
          filteredRow[col.key] = row[col.key] ?? "";
        }

        if (config.key === "vendas_trocas") {
          filteredRow.motivo_parcial = row.motivo_parcial ?? "";
          filteredRow.confirmacao_correcao = row.confirmacao_correcao ?? "";
        }
        return filteredRow;
      });

    onImport(filteredRows);
    setConfirmOpen(false);
  };

  useEffect(() => {
    const loadDeps = async () => {
      if (!open) return;

      if (!config.deps || Object.keys(config.deps).length === 0) {
        setLoadingDeps(false);
        return;
      }

      setLoadingDeps(true);
      setDepsOptions({});
      const result: Record<string, unknown> = {};

      const loaders = Object.entries(config.deps).map(async ([key, loader]) => {
        try {
          result[key] = await loader();
        } catch (err) {
          console.error(`Erro ao carregar dependência ${key}:`, err);
          result[key] = [];
        }
      });

      await Promise.all(loaders);
      setDepsOptions(result);
      setLoadingDeps(false);
    };
    loadDeps();
  }, [open, config.deps]);

  /**
   * Retorna os índices (0-based) das linhas selecionadas que contêm erros
   */
  const linhasComErrosIndexes = useMemo(() => {
    if (renderedRows.length === 0 || selectedRows.size === 0) return [];

    const requiredKeys = config.columns.filter((col) => col.required).map((col) => col.key);

    return renderedRows
      .map((row, rowIndex) => ({ row, rowIndex }))
      .filter(({ row, rowIndex }) => {
        if (!row) return true;
        if (!selectedRows.has(rowIndex)) return false;

        return requiredKeys.some((key) => {
          const val = row[key];
          return val === undefined || val === null || String(val).trim() === "";
        });
      })
      .map(({ rowIndex }) => rowIndex);
  }, [renderedRows, config.columns, selectedRows]);

  const hasRequiredFields = useMemo(() => linhasComErrosIndexes.length > 0, [linhasComErrosIndexes]);

  const openEditModal = (globalRowIndex: number) => {
    setEditingRowIndex(globalRowIndex);
    setEditingData({ ...renderedRows[globalRowIndex] });
  };

  const saveEditedRow = () => {
    if (editingRowIndex === null) return;

    setRenderedRows((prev) => {
      const updated = [...prev];
      updated[editingRowIndex] = { ...editingData, confirmacao_correcao: "" };
      return updated;
    });

    setEditingRowIndex(null);
    setEditingData({});
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col">
          <DialogHeader>
            <DialogTitle>Pré-visualização — {config.label}</DialogTitle>
            <DialogDescription>
              Revise os registros abaixo. Corrija ou desmarque as linhas que não deseja importar.
            </DialogDescription>
          </DialogHeader>

          <>
            {config.key === "vendas_trocas" && (
              <div className="space-y-2 text-sm" aria-live="polite">
                {tradeValidation.pending && <p>Validando saldos e correções das trocas...</p>}
                {tradeValidation.error && <p role="alert">{tradeValidation.error} <Button variant="outline" onClick={tradeValidation.retry}>Tentar novamente</Button></p>}
                {tradeValidation.results.some(result => result.status === "error" || result.status === "confirmation") && <p role="alert" className="text-red-600">Existem trocas que precisam de revisão. Corrija, confirme ou desmarque os registros abaixo.</p>}
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {tradeValidation.results.filter(result => result.status === "error" || result.status === "confirmation").map(result => (
                    <div key={result.row_index} className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditModal(result.row_index)}>Registro {result.row_index + 1}</Button>
                      <span>{result.message}</span>
                      {result.status === "confirmation" && <Button size="sm" variant="outline" onClick={() => setCorrection(result)}>Revisar confirmação</Button>}
                      <Button size="sm" variant="ghost" onClick={() => setSelectedRows(previous => { const next = new Set(previous); next.delete(result.row_index); return next; })}>Desmarcar</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {hasDuplicates && (
              <div role="alert" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                <p className="font-medium">{duplicateIndexes.size} registros selecionados possuem a mesma chave de importação.</p>
                <p>Corrija os dados ou desmarque as repetições para liberar a importação. A verificação considera apenas este arquivo.</p>
              </div>
            )}
            {(hasDuplicates || duplicatesOnly) && (
              <Button variant="outline" className="self-start" onClick={() => { setDuplicatesOnly(!duplicatesOnly); setPage(1); }}>
                {duplicatesOnly ? "Mostrar todos os registros" : "Ir para registros duplicados"}
              </Button>
            )}
            {duplicatesOnly && !hasDuplicates && <p role="status" className="text-sm">Duplicatas resolvidas. Volte a todos os registros para continuar a revisão.</p>}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {hasRequiredFields && (
                  <div>
                    <p className="text-sm text-red-500 font-medium">
                      Existem campos obrigatórios não preenchidos nas linhas selecionadas.
                    </p>
                    <div className="flex gap-2 items-center mt-2">
                      <p className="text-xs text-red-500 font-medium">Linhas com erros (clique para editar):</p>
                      <div className="flex gap-1.5 items-center flex-wrap max-h-20 overflow-y-auto">
                        {linhasComErrosIndexes.map((rowIndex) => (
                          <Badge
                            key={rowIndex}
                            variant="destructive"
                            className="cursor-pointer hover:bg-red-700 text-white text-xs py-1 px-2 flex items-center gap-1"
                            onClick={() => openEditModal(rowIndex)}
                          >
                            Linha {rowIndex + 1} <Pencil className="h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0 mt-2">
              {loadingDeps ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
                    <p className="text-sm text-gray-500">Carregando dependências...</p>
                  </div>
                </div>
              ) : (
                <DataGrid
                  data={pageIndexedRows}
                  columns={[
                    {
                      id: "_rowIndex",
                      header: "Registro / corrigir",
                      width: 160,
                      renderCell: (_value: unknown, row: IndexedRow) => (
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(Number(row._rowIndex))}>
                          <Pencil className="mr-1 h-3 w-3" />
                          {Number(row._rowIndex) + 1}{duplicateIndexes.has(Number(row._rowIndex)) ? " · Duplicado" : ""}
                        </Button>
                      ),
                    },
                    ...(config.key === "vendas_trocas" ? [{
                      id: "_validation", header: "Validação da troca", width: 300,
                      renderCell: (_value: unknown, row: IndexedRow) => {
                        const result = tradeResults.get(Number(row._rowIndex));
                        return result ? <div className="whitespace-normal text-xs">
                          <p>{result.message}</p>
                          {result.disponivel !== undefined && <p>Saldo da nota: {result.disponivel} · Aprovado disponível: {result.aprovada}</p>}
                        </div> : null;
                      },
                    }] : []),
                    ...(config.columnsDef(depsOptions) ?? []),
                  ]}
                  getRowId={(row) => row["_rowIndex"] as number}
                  enableSelection
                  selectedRows={selectedRows}
                  onSelectionChange={setSelectedRows}
                  height="100%"
                  enableStripedRows={false}
                  className="max-h-110 overflow-auto"
                  rowClassName={(row) => {
                    const globalIndex = Number(row["_rowIndex"]);
                    return tradeResults.get(globalIndex)?.status === "error" ? "bg-red-50" : duplicateIndexes.has(globalIndex) ? "bg-amber-50" : linhasComErrosIndexes.includes(globalIndex) ? "bg-red-50" : "";
                  }}
                />
              )}
            </div>

            <Paginacao
              page={currentPage}
              pageSize={pageSize}
              total={visibleRows.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
              className="border-t pt-3"
            >
              {selectedRows.size} de {renderedRows.length} registro(s) selecionado(s).
            </Paginacao>
          </>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              disabled={selectedRows.size === 0 || importing || hasRequiredFields || hasDuplicates || tradeValidation.blocked}
              onClick={() => setConfirmOpen(true)}
            >
              <UploadIcon className="mr-1 h-4 w-4" />
              Importar ({selectedRows.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE EDIÇÃO DA LINHA */}
      <Dialog open={editingRowIndex !== null} onOpenChange={(open) => !open && setEditingRowIndex(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Linha {editingRowIndex !== null ? editingRowIndex + 1 : ""}</DialogTitle>
            <DialogDescription>
              Corrija os dados abaixo. Os campos com erro estão destacados.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-2">
            {config.key === "vendas_trocas" && ["5", "39"].includes(String(editingData.operacao).trim()) && (
              <div className="space-y-2">
                {editingRowIndex !== null && <p className="text-sm">{tradeResults.get(editingRowIndex)?.message}</p>}
                <Label htmlFor="motivo-parcial">Motivo do envio parcial (será mostrado ao cliente no WhatsApp)</Label>
                <Input id="motivo-parcial" maxLength={1000} value={editingData.motivo_parcial ?? ""} onChange={event => setEditingData(previous => ({ ...previous, motivo_parcial: event.target.value }))} />
              </div>
            )}
            {config.columns.map((col) => {
              const value = editingData[col.key];
              // Valida se o campo é obrigatório e está vazio ou contendo apenas espaços
              const hasError = col.required && (!value || String(value).trim() === "");

              return (
                <div key={col.key} className="grid gap-1.5">
                  <Label
                    htmlFor={col.key}
                    className={hasError ? "text-red-600 font-semibold flex justify-between items-center" : ""}
                  >
                    <span>{col.header} {col.required && "*"}</span>
                    {hasError && <span className="text-xs font-normal text-red-500">Campo Obrigatório</span>}
                  </Label>

                  {
                    col.key === 'dt_operacao' || col.key === 'emissao' ? (
                      <DatePicker
                        className="h-12 w-full"
                        placeholder="Selecione a data"
                        date={editingData[col.key] ? new Date(editingData[col.key]) : undefined}
                        onSelect={(date) => setEditingData({ ...editingData, [col.key]: dayjs(date).toISOString() })}
                      />
                    ) : (
                      <Input
                        id={col.key}
                        value={value || ""}
                        onChange={(e) => setEditingData({ ...editingData, [col.key]: e.target.value })}
                        className={
                          hasError
                            ? "border-red-500 bg-red-50/50 focus-visible:ring-red-500 text-red-900 placeholder:text-red-300"
                            : ""
                        }
                        placeholder={hasError ? "Preenchimento obrigatório..." : ""}
                      />
                    )
                  }

                  {hasError && (
                    <p className="text-[0.75rem] text-red-500 font-medium">
                      Este campo não pode ficar em branco.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRowIndex(null)}>
              Cancelar
            </Button>
            <Button
              onClick={saveEditedRow}
              disabled={config.columns.some(
                (col) => col.required && (!editingData[col.key] || String(editingData[col.key]).trim() === "")
              )}
            >
              Salvar Correções
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={correction !== null} onOpenChange={value => !value && setCorrection(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar nova correção — registro {(correction?.row_index ?? 0) + 1}</AlertDialogTitle>
            <AlertDialogDescription>{correction?.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!correction?.confirmation_token) return;
              setRenderedRows(previous => previous.map((row, index) => index === correction.row_index ? { ...row, confirmacao_correcao: correction.confirmation_token! } : row));
              setCorrection(null);
            }}>Confirmar correção e novo aviso</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Importação</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a importar <strong>{selectedRows.size} registro(s)</strong> de{" "}
              <strong>{config.label}</strong>. Essa ação não pode ser desfeita. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={selectedRows.size === 0 || importing || hasRequiredFields || hasDuplicates || tradeValidation.blocked} onClick={handleConfirm}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
