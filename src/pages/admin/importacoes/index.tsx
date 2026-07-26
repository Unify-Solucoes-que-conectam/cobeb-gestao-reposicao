import Loader from "@/components/custom/loader";
import { ImportProgressPanel, type ImportBatch } from "@/components/custom/progress-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useHeader } from "@/hooks/use-header";
import axios from "@/lib/axios";
import { IMPORTER_CONFIGS, generateTemplate, type ImporterConfig } from "@/lib/xlsx-helpers";
import { DownloadIcon, UploadIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const API_IMPORT_TYPES = new Set([
  "produtos",
  "clientes",
  "motoristas",
  "mapas",
  "vendas_trocas"
]);

function ImporterCard({
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

  const handleDownloadTemplate = () => {
    generateTemplate(config);
    toast.success(`Template ${config.label} baixado!`);
  };

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

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setBatch(null);

    if (!API_IMPORT_TYPES.has(config.key)) {
      toast.warning("Esta importacao ainda nao esta disponivel via API.");
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    if (!apiUrl) {
      toast.error("VITE_API_URL nao configurado");
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    if (!token) {
      toast.error("Token nao encontrado. Faca login novamente.");
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    try {
      const formData = new FormData();
      formData.append("type", config.key);
      formData.append("file", file, file.name);

      const response = await axios.post(`${apiUrl}/imports`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      const payload = response.data;
      if (!response.status.toString().startsWith("2") || !payload.success) {
        toast.error(payload?.message || "Erro ao iniciar importacao");
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
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{config.label}</CardTitle>
        <CardDescription className="text-xs">
          O arquivo de importação deve conter obrigatoriamente as colunas: <br></br>
          <strong>{config.columns.map((c) => c.header).join(", ")}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <DownloadIcon className="h-4 w-4 mr-1" /> Template
          </Button>
          <div className="flex-1">
            <Button
              size="sm"
              className="w-full"
              disabled={importing}
              type="button"
              onClick={() => fileRef.current?.click()}
            >
              {importing ? <Loader /> : <UploadIcon className="h-4 w-4 mr-1" />}
              {importing ? "Importando..." : "Importar"}
            </Button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} disabled={importing} />
          </div>
        </div>
        <ImportProgressPanel
          batchId={batch?.id}
          initialBatch={batch}
          onUpdate={handleBatchUpdate}
        />
      </CardContent>
    </Card>
  );
}

export default function AdminImportacoes() {

  // ================ STATE & REFS ================
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  const [activeBatches, setActiveBatches] = useState<Record<string, ImportBatch>>({});

  // ================ HOOKS ================
  const { token } = useAuth();
  const { setPageBreadcrumbs } = useHeader();

  // ================ CALLBACKS ================
  const entityConfigs = IMPORTER_CONFIGS.filter((c) =>
    ["clientes", "produtos", "motoristas"].includes(c.key)
  );
  const nfConfigs = IMPORTER_CONFIGS.filter((c) =>
    ["mapas", "vendas_trocas"].includes(c.key)
  );

  const loadActiveBatches = useCallback(async () => {
    if (!apiUrl || !token) return;
    try {
      const response = await axios.get(`${apiUrl}/imports`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const payload = response.data;
      const list = payload?.data || [];
      const nextMap: Record<string, ImportBatch> = {};

      for (const item of list as ImportBatch[]) {
        if (!nextMap[item.type]) {
          nextMap[item.type] = item;
        }
      }

      setActiveBatches(nextMap);
    } catch {
      // ignore load errors
    }
  }, [apiUrl, token]);

  // Load on mount
  useEffect(() => {
    loadActiveBatches();
  }, [loadActiveBatches]);

  // Reload when page becomes visible again (tab switch, window focus)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadActiveBatches();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", loadActiveBatches);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", loadActiveBatches);
    };
  }, [loadActiveBatches]);

  // Child cards notify parent when batch changes
  const handleBatchChange = useCallback((type: string, batch: ImportBatch) => {
    setActiveBatches((prev) => ({ ...prev, [type]: batch }));
  }, []);

  // ================ TITLE & BREADCRUMBS ================
  useEffect(() => {

    // definir título da página
    setPageBreadcrumbs([
      { title: "Importações", href: "/admin/importacoes" }
    ]);
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Importar Dados</h1>
      <p className="text-sm text-muted-foreground">
        Baixe o template XLSX, preencha e importe. Cadastros auxiliares devem ser importados antes de clientes, produtos e notas fiscais.
      </p>

      <Tabs defaultValue="auxiliares" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger className="dark:data-[state=active]:bg-primary!" value="entidades">Cadastros</TabsTrigger>
          <TabsTrigger className="dark:data-[state=active]:bg-primary!" value="notas">Notas Fiscais</TabsTrigger>
        </TabsList>

        <TabsContent value="entidades" className="space-y-3 mt-4">
          <p className="text-xs text-muted-foreground">Cadastre clientes, produtos e motoristas.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {entityConfigs.map((c) => (
              <ImporterCard key={c.key} config={c} initialBatch={activeBatches[c.key]} onBatchChange={handleBatchChange} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notas" className="space-y-3 mt-4">
          <p className="text-xs text-muted-foreground">Importe notas fiscais e seus produtos. Clientes e produtos devem existir primeiro.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {nfConfigs.map((c) => (
              <ImporterCard key={c.key} config={c} initialBatch={activeBatches[c.key]} onBatchChange={handleBatchChange} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
