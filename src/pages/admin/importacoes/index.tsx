import { type ImportBatch } from "@/components/custom/progress-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useHeader } from "@/hooks/use-header";
import axios from "@/lib/axios";
import { useCallback, useEffect, useState } from "react";
import { ImporterCard } from "./components/import-card";
import { IMPORTER_CONFIGS } from "./config";
import { AlertTriangleIcon } from "lucide-react";

export default function AdminImportacoes() {
	const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
	const [activeBatches, setActiveBatches] = useState<Record<string, ImportBatch>>({});

	const { token } = useAuth();
	const { setPageBreadcrumbs } = useHeader();

	const cadastrosConfigs = IMPORTER_CONFIGS.filter((c) =>
		["clientes", "produtos", "motoristas"].includes(c.key),
	);
	const mapasConfigs = IMPORTER_CONFIGS.filter((c) => ["mapas"].includes(c.key));
	const vendasTrocasConfigs = IMPORTER_CONFIGS.filter((c) => ["vendas_trocas"].includes(c.key));

	const loadActiveBatches = useCallback(async () => {
		if (!apiUrl || !token) return;
		try {
			const response = await axios.get(`${apiUrl}/importar`, {
				headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
			});

			const list = (response.data?.data || []) as ImportBatch[];
			const nextMap: Record<string, ImportBatch> = {};
			for (const item of list) {
				if (!nextMap[item.type]) nextMap[item.type] = item;
			}
			setActiveBatches(nextMap);
		} catch {
			// ignore load errors
		}
	}, [apiUrl, token]);

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

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold">Importar Dados</h1>
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
