import { ColumnDef } from "@/components/custom/data-grid";
import { AlertCircle } from "lucide-react";
import { IMPORTER_CONFIGS, SelectOption } from "../config";

export type ProdutoRow = Record<string, unknown>;

const renderValue = (value: unknown, col: { key: string; required?: boolean }, formatter?: (val: string) => React.ReactNode) => {
  const strValue = String(value ?? "").trim();

  if (!strValue && col.required) {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-600">
        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
        Obrigatório
      </span>
    )
  }

  return formatter ? formatter(strValue) : strValue === '' ? '-' : strValue;
};

export const produtoColumns = (_depsOptions: Record<string, SelectOption<string>[]>): ColumnDef<ProdutoRow>[] => {
  const columns = IMPORTER_CONFIGS.find((c) => c.key === "produtos")?.columns ?? [];
  const columnsMap = new Map<string, ColumnDef<ProdutoRow>>();

  columns.forEach((col) => {
    columnsMap.set(col.key, {
      id: col.key,
      header: col.header,
      renderCell: (value) => renderValue(value, { key: col.key }),
    });
  });

  return Array.from(columnsMap.values());
};