import { ImportBatch, ImportProgressPanel } from "@/components/custom/progress-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import axios from "@/lib/axios";
import { UploadIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImportPreviewDialog } from "./import-preview-dialog";
import { ImporterConfig, parseXlsxMapped } from "./config";

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

  // Step 1: Read file and open preview dialog
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const allRows = await parseXlsxMapped(file, config);

      const nonEmpty = allRows.filter((row) =>
        Object.values(row).some((v) => v !== null && String(v).trim() !== ""),
      );

      if (nonEmpty.length === 0) {
        toast.warning("Nenhum registro encontrado no arquivo.");
        return;
      }

      setPreviewRows(nonEmpty);
      setPreviewOpen(true);
    } catch {
      toast.error("Erro ao ler o arquivo. Verifique se o formato está correto.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
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
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
              disabled={importing}
            />
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
    </>
  );
}