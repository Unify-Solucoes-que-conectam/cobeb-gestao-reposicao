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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ImporterConfig } from "./config";

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
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [depsOptions, setDepsOptions] = useState<Record<string, any>>({});
  const [loadingDeps, setLoadingDeps] = useState(true);

  // Select all rows by default whenever rows change
  useEffect(() => {
    setSelectedRows(new Set(rows.map((_, i) => i)));
    setPage(1);
  }, [rows]);

  const indexedRows: IndexedRow[] = useMemo(
    () => rows.map((row, i) => ({ ...row, _rowIndex: i })),
    [rows]
  );

  const pageStart = (page - 1) * pageSize;
  const pageIndexedRows = useMemo(
    () => indexedRows.slice(pageStart, pageStart + pageSize),
    [indexedRows, pageStart, pageSize]
  );

  const handleConfirm = () => {

    // retorna apenas as colunas esperadas.
    const filteredRows = rows.filter((_, i) => selectedRows.has(i)).map((row) => {
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
      if (!open) {
        return;
      }

      // Se não há dependências, não precisa carregar nada
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

  const hasEmptyFields = useMemo(() => {
    if (selectedRows.size === 0) return false;

    const expectedKeys = config.columns.map((col) => col.key);

    return Array.from(selectedRows).some((rowIndex) => {
      const row = rows[rowIndex as number];
      if (!row) return true;

      return expectedKeys.some((key) => {
        const val = row[key];
        return val === undefined || val === null || String(val).trim() === "";
      });
    });
  }, [selectedRows, rows, config.columns]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col">
          <DialogHeader>
            <DialogTitle>Pré-visualização — {config.label}</DialogTitle>
            <DialogDescription>
              Revise os registros abaixo. Desmarque as linhas que não deseja importar.
            </DialogDescription>
          </DialogHeader>

          {
            hasEmptyFields && (
              <p className="text-sm text-red-500">Existem campos obrigatórios não preenchidos.</p>
            )
          }

          <div className="flex-1 min-h-0">
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
              />
            )}
          </div>

          <Paginacao
            page={page}
            pageSize={pageSize}
            total={rows.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            className="border-t pt-3"
          >
            {selectedRows.size} de {rows.length} registro(s) selecionado(s).
          </Paginacao>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              disabled={selectedRows.size === 0 || importing || hasEmptyFields}
              onClick={() => setConfirmOpen(true)}
            >
              <UploadIcon className="mr-1 h-4 w-4" />
              Importar ({selectedRows.size})
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
