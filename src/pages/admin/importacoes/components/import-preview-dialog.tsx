import { DataGrid } from "@/components/custom/data-grid";
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
import { UploadIcon, Pencil, FileWarning } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ImporterConfig } from "../config";

interface ImportPreviewDialogProps {
  config: ImporterConfig;
  rows: Record<string, string>[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (selectedRows: Record<string, string>[]) => void;
  importing: boolean;
}

type IndexedRow = Record<string, string | number>;

export function ImportPreviewDialog({
  config,
  rows,
  open,
  onOpenChange,
  onImport,
  importing,
}: ImportPreviewDialogProps) {
  const [renderedRows, setRenderedRows] = useState<Record<string, string>[]>(rows);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [depsOptions, setDepsOptions] = useState<Record<string, any>>({});
  const [loadingDeps, setLoadingDeps] = useState(true);

  // Estado para controlar o modal de edição de linha
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Record<string, string>>({});

  // Reseta os dados e a seleção apenas ao abrir o modal
  useEffect(() => {
    if (open) {
      setRenderedRows(rows);
      setSelectedRows(new Set(rows.map((_, i) => i)));
      setPage(1);
    }
  }, [open, rows]);

  const indexedRows: IndexedRow[] = useMemo(
    () => renderedRows.map((row, i) => ({ ...row, _rowIndex: i })),
    [renderedRows]
  );

  const pageStart = (page - 1) * pageSize;
  const pageIndexedRows = useMemo(
    () => indexedRows.slice(pageStart, pageStart + pageSize),
    [indexedRows, pageStart, pageSize]
  );

  const handleConfirm = () => {
    const filteredRows = renderedRows
      .filter((_, i) => selectedRows.has(i))
      .map((row) => {
        const filteredRow: Record<string, string> = {};

        for (const col of config.columns) {
          filteredRow[col.key] = row[col.key] ?? "";
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
  const hasTooManyErrors = useMemo(() => linhasComErrosIndexes.length > 10, [linhasComErrosIndexes]);

  const openEditModal = (globalRowIndex: number) => {
    setEditingRowIndex(globalRowIndex);
    setEditingData({ ...renderedRows[globalRowIndex] });
  };

  const saveEditedRow = () => {
    if (editingRowIndex === null) return;

    setRenderedRows((prev) => {
      const updated = [...prev];
      updated[editingRowIndex] = { ...editingData };
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
              {hasTooManyErrors
                ? "Muitos erros encontrados no arquivo."
                : "Revise os registros abaixo. Desmarque as linhas que não deseja importar."}
            </DialogDescription>
          </DialogHeader>

          {hasTooManyErrors ? (
            // VIEW DE BLOQUEIO POR EXCESSO DE ERROS
            <div className="flex flex-col items-center justify-center flex-1 space-y-4 py-12 px-4 text-center">
              <div className="rounded-full bg-red-100 p-4">
                <FileWarning className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Atenção: Existem muitos registros com erro
              </h3>
              <p className="text-sm text-gray-500 max-w-lg">
                Identificamos <strong>{linhasComErrosIndexes.length} registros</strong> com campos obrigatórios não preenchidos.
                Como a correção manual de todos esses dados por aqui seria inviável, por favor, verifique sua planilha original no Excel, preencha os dados em branco e tente realizar a importação novamente.
              </p>
            </div>
          ) : (
            // VIEW NORMAL COM DATAGRID
            <>
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
                    columns={config.columnsDef(depsOptions) ?? []}
                    getRowId={(row) => row["_rowIndex"] as number}
                    enableSelection
                    selectedRows={selectedRows}
                    onSelectionChange={setSelectedRows}
                    height="100%"
                    enableStripedRows={false}
                    className="max-h-110 overflow-auto"
                    rowClassName={(row) => {
                      const globalIndex = Number(row["_rowIndex"]);
                      return linhasComErrosIndexes.includes(globalIndex) ? "bg-red-50" : "";
                    }}
                  />
                )}
              </div>

              <Paginacao
                page={page}
                pageSize={pageSize}
                total={renderedRows.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                className="border-t pt-3"
              >
                {selectedRows.size} de {renderedRows.length} registro(s) selecionado(s).
              </Paginacao>
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {hasTooManyErrors ? "Fechar e Corrigir Planilha" : "Cancelar"}
            </Button>
            {!hasTooManyErrors && (
              <Button
                disabled={selectedRows.size === 0 || importing || hasRequiredFields}
                onClick={() => setConfirmOpen(true)}
              >
                <UploadIcon className="mr-1 h-4 w-4" />
                Importar ({selectedRows.size})
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE EDIÇÃO DA LINHA */}
      <Dialog open={editingRowIndex !== null} onOpenChange={(open) => !open && setEditingRowIndex(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Linha {editingRowIndex !== null ? editingRowIndex + 1 : ""}</DialogTitle>
            <DialogDescription>
              Corrija os dados abaixo. Os campos com erro estão destacados.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
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
            <AlertDialogAction onClick={handleConfirm}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}