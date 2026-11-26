import { type ImportBatch } from "@/components/custom/progress-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useHeader } from "@/hooks/use-header";
import { importerService } from "@/services/api.service";
import { AlertTriangleIcon, BuildingIcon, GlobeIcon, LockIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ImporterCard } from "./components/import-card";
import { IMPORTER_CONFIGS } from "./config";

export default function AdminImportacoes() {
	const [activeBatches, setActiveBatches] = useState<Record<string, ImportBatch>>({});

	const { setPageBreadcrumbs } = useHeader();
	const { can, tenant } = useAuth();

	const cadastrosConfigs = IMPORTER_CONFIGS.filter((c) =>
		["clientes", "produtos", "motoristas"].includes(c.key),
	);
	const mapasConfigs = IMPORTER_CONFIGS.filter((c) => ["mapas"].includes(c.key));
	const vendasTrocasConfigs = IMPORTER_CONFIGS.filter((c) => ["vendas_trocas"].includes(c.key));

	const loadActiveBatches = useCallback(async () => {
		try {
			const response = await importerService.read();

			const list = response.data;
			const nextMap: Record<string, ImportBatch> = {};
			for (const item of list) {
				if (!nextMap[item.type]) nextMap[item.type] = item;
			}
			setActiveBatches(nextMap);
		} catch {
			// ignore load errors
		}
	}, []);

	useEffect(() => {
		loadActiveBatches();
	}, [loadActiveBatches]);

	useEffect(() => {
		const handleVisibility = () => {
			if (document.visibilityState === "visible") loadActiveBatches();
		};
		document.addEventListener("visibilitychange", handleVisibility);
		window.addEventListener("focus", loadActiveBatches);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibility);
			window.removeEventListener("focus", loadActiveBatches);
		};
	}, [loadActiveBatches]);

	const handleBatchChange = useCallback((type: string, batch: ImportBatch) => {
		setActiveBatches((prev) => ({ ...prev, [type]: batch }));
	}, []);

	useEffect(() => {
		setPageBreadcrumbs([{ title: "Importações", href: "/admin/importacoes" }]);
	}, []);

	if (!can("importacoes.importar")) {
		return (
			<div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
				<LockIcon className="size-8" />
				<p>Seu grupo não tem permissão para importar dados.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold">Importar Dados</h1>
			{tenant && (
				<div className="flex items-start gap-2 rounded-md border p-3 text-sm">
					{tenant.geral ? <GlobeIcon className="mt-0.5 size-4 shrink-0" /> : <BuildingIcon className="mt-0.5 size-4 shrink-0" />}
					<p>
						{tenant.geral ? (
							<>Conectado em <strong>Geral</strong>: informe a filial em cada registro do arquivo.</>
						) : (
							<>Conectado em <strong>{tenant.nome}</strong>: tudo será importado para esta filial, sem precisar preencher a coluna de filial. Para importar para outra filial, troque no topo do menu.</>
						)}
					</p>
				</div>
			)}
			<div className="text-sm text-muted-foreground">
				<p>Cadastros auxiliares devem ser importados antes de clientes, produtos e notas fiscais.</p>
				<p className="flex items-center gap-1 text-amber-700"><AlertTriangleIcon className="size-4" />Limite máximo de 20.000 registros por importação.</p>
			</div>

			<Tabs defaultValue="cadastros" className="w-full">
				<TabsList className="w-full grid grid-cols-3">
					<TabsTrigger className="dark:data-[state=active]:bg-primary!" value="cadastros">
						Cadastros
					</TabsTrigger>
					<TabsTrigger className="dark:data-[state=active]:bg-primary!" value="mapas">
						Mapas
					</TabsTrigger>
					<TabsTrigger className="dark:data-[state=active]:bg-primary!" value="vendas_trocas">
						Vendas & Trocas
					</TabsTrigger>
				</TabsList>

				<TabsContent value="cadastros" className="mt-4 space-y-3">
					<p className="text-xs text-muted-foreground">Cadastre clientes, produtos e motoristas.</p>
					<div className="grid gap-3 md:grid-cols-2">
						{cadastrosConfigs.map((c) => (
							<ImporterCard
								key={c.key}
								config={c}
								initialBatch={activeBatches[c.key]}
								onBatchChange={handleBatchChange}
							/>
						))}
					</div>
				</TabsContent>

				<TabsContent value="mapas" className="mt-4 space-y-3">
					<p className="text-xs text-muted-foreground">
						Importe mapas. Clientes, produtos e motoristas devem existir primeiro.
					</p>
					<div className="grid gap-3 md:grid-cols-2">
						{mapasConfigs.map((c) => (
							<ImporterCard
								key={c.key}
								config={c}
								initialBatch={activeBatches[c.key]}
								onBatchChange={handleBatchChange}
							/>
						))}
					</div>
				</TabsContent>

				<TabsContent value="vendas_trocas" className="mt-4 space-y-3">
					<p className="text-xs text-muted-foreground">
						Importe vendas e trocas. Clientes, produtos e motoristas devem existir primeiro.
					</p>
					<div className="grid gap-3 md:grid-cols-2">
						{vendasTrocasConfigs.map((c) => (
							<ImporterCard
								key={c.key}
								config={c}
								initialBatch={activeBatches[c.key]}
								onBatchChange={handleBatchChange}
							/>
						))}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
