import { DataImporter } from "@/components/custom/data-importer";
import { ImportBatch, ImportProgressPanel } from "@/components/custom/progress-panel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import axios from "@/lib/axios";
import { downloadBlob } from "@/lib/utils";
import { importerModelService } from "@/services/api.service";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImporterConfig, parseXlsxMapped } from "../config";
import { ImportPreviewDialog } from "./import-preview-dialog";
import { UploadIcon } from "lucide-react";

export function ImporterCard({
  config,
  initialBatch,
  onBatchChange,
}: {
  config: ImporterConfig;
  initialBatch?: ImportBatch | null;
  onBatchChange?: (type: string, batch: ImportBatch) => void;
}) {
  const [importing, setImporting] = useState(false);
  const [batch, setBatch] = useState<ImportBatch | null>(initialBatch ?? null);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Novos estados para o AlertDialog de erro
  const [wrongFileOpen, setWrongFileOpen] = useState(false);
  const [missingCols, setMissingCols] = useState<string>("");

  const fileRef = useRef<HTMLInputElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  const { token } = useAuth();

  // Sync from parent (e.g. on mount / after loadActiveBatches)
  useEffect(() => {
    if (!initialBatch) return;
    setBatch((prev) => {
      if (prev && prev.id === initialBatch.id && prev.status === initialBatch.status) return prev;
      return initialBatch;
    });
    const isActive = initialBatch.status === "pending" || initialBatch.status === "processing";
    setImporting(isActive);
  }, [initialBatch]);

  const handleBatchUpdate = useCallback(
    (nextBatch: ImportBatch) => {
      setBatch(nextBatch);
      onBatchChange?.(config.key, nextBatch);
      if (nextBatch.status === "completed" || nextBatch.status === "failed") {
        setImporting(false);
      }
    },
    [config.key, onBatchChange],
  );

  // Step 1: Read file and open preview dialog ou mostrar erro
  const handleFileChange = async (file: File[]) => {

    setImporting(true);
    if (!file || file.length === 0) return;
    const selectedFile = file[0]; 

    try {
      const allRows = await parseXlsxMapped(selectedFile, config);

      const nonEmpty = allRows.filter((row) =>
        Object.values(row).some((v) => v !== null && String(v).trim() !== ""),
      );

      if (nonEmpty.length === 0) {
        toast.warning("Nenhum registro encontrado no arquivo.");
        return;
      }

      // Obtém as chaves encontradas na primeira linha do arquivo
      const rowKeys = new Set(Object.keys(nonEmpty[0]));

      // Identifica se falta alguma coluna obrigatória
      const missingColumns = config.columns.filter((col) => !rowKeys.has(col.key));

      if (missingColumns.length > 0) {
        const missingNames = missingColumns.map((c) => c.header).join(", ");
        setMissingCols(missingNames);
        setWrongFileOpen(true); // Abre o AlertDialog ao invés do Toast
        return;
      }

      setPreviewRows(nonEmpty);
      setPreviewOpen(true);
    } catch {
      toast.error("Erro ao ler o arquivo. Verifique se o formato está correto.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
      setImporting(false);
    }
  };

  // Step 2: Send selected records to API as JSON
  const handleImport = async (selectedRows: Record<string, string>[]) => {
    setPreviewOpen(false);
    setImporting(true);
    setBatch(null);

    if (!apiUrl) {
      toast.error("VITE_API_URL não configurado");
      setImporting(false);
      return;
    }

    if (!token) {
      toast.error("Token não encontrado. Faça login novamente.");
      setImporting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/importar`,
        { type: config.key, records: selectedRows },
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } },
      );

      const payload = response.data;
      if (!response.status.toString().startsWith("2") || !payload.success) {
        toast.error(payload?.message || "Erro ao iniciar importação");
        setImporting(false);
        return;
      }

      const created = payload?.data as ImportBatch | undefined;
      if (created) {
        setBatch(created);
        onBatchChange?.(config.key, created);

        if (created.status === "completed") {
          toast.success("Importação concluída com sucesso!");
          setImporting(false);
        } else if (created.status === "failed") {
          toast.error(created.last_log || "Importação falhou.");
          setImporting(false);
        } else {
          toast.success("Importação enfileirada. Acompanhe o progresso abaixo.");
        }
      } else {
        toast.warning("Importação iniciada, mas sem retorno de lote.");
      }
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
      setImporting(false);
    }
  };

  const handleDownloadModel = useCallback(async () => {
    try {
      const res = await importerModelService.downloadModel(config.key);

      downloadBlob(res, 'modelo_importacao_' + config.key + '.xlsx');
    } catch {
      toast.error('Ocorreu um erro ao tentar baixar o modelo de importação.', {
        description: 'Se o problema persistir, entre em contato com o suporte.',
      })
    }
  }, [])

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{config.label}</CardTitle>
          <CardDescription className="text-xs">
            O arquivo de importação deve conter obrigatoriamente as colunas: <br />
            <strong>{config.columns.map((c) => c.header).join(", ")}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex-1">
            <DataImporter
              acceptedFiles={['xlsx', 'xls', 'csv']}
              multiple={false}
              mode='async'
              onSave={handleFileChange}
              onDownloadModel={handleDownloadModel}
            >
              <Button
                size="sm"
                className="w-full"
                disabled={importing}
                type="button"
                onClick={() => fileRef.current?.click()}
                loading={importing}
              >
                {!importing && <UploadIcon className="mr-1 h-4 w-4" />}
                {importing ? "Importando..." : "Importar"}
              </Button>
            </DataImporter>
          </div>
          <ImportProgressPanel
            batchId={batch?.id}
            initialBatch={batch}
            onUpdate={handleBatchUpdate}
          />
        </CardContent>
      </Card>

      <ImportPreviewDialog
        config={config}
        rows={previewRows}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onImport={handleImport}
        importing={importing}
      />

      {/* Novo AlertDialog de Validação de Arquivo */}
      <AlertDialog open={wrongFileOpen} onOpenChange={setWrongFileOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivo Incorreto</AlertDialogTitle>
            <AlertDialogDescription>
              O arquivo selecionado não é válido para a importação de <strong>{config.label}</strong>.
              <br /><br />
              <strong>Colunas ausentes ou não identificadas:</strong> {missingCols}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setWrongFileOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}