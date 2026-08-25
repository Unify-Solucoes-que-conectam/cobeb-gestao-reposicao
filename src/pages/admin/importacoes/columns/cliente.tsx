import { ColumnDef } from "@/components/custom/data-grid";
import { formatCPF } from "@/utils/formatters";
import { AlertCircle } from "lucide-react";
import { IMPORTER_CONFIGS, SelectOption } from "../config";

export type ClienteRow = Record<string, unknown>;

const renderValue = (value: unknown, col: { key: string; required?: boolean }, formatter?: (val: string) => React.ReactNode) => {
  const strValue = String(value ?? "").trim();

  if (!strValue && col.required) {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-600">
        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
        Obrigatório
      </span>
    );
  }

  return formatter ? formatter(strValue) : strValue === '' ? '-' : strValue;
};

export const clienteColumns = (depsOptions?: Record<string, SelectOption<string>[]>): ColumnDef<ClienteRow>[] => {
  const columns = IMPORTER_CONFIGS.find((c) => c.key === "clientes")?.columns ?? [];
  const columnsMap = new Map<string, ColumnDef<ClienteRow>>();

  columns.forEach((col) => {
    columnsMap.set(col.key, {
      id: col.key,
      header: col.header,
      renderCell: (value) => renderValue(value, col),
    });
  });

  columnsMap.set("documento", {
    id: "documento",
    header: "Documento",
    renderCell: (value) =>
      renderValue(value, { key: "documento", required: true }, (val) => {
        const digits = val.replace(/\D/g, "");
        if (digits.length === 11) return formatCPF(digits);
        return val;
      }),
  });

  columnsMap.set("cep", {
    id: "cep",
    header: "CEP",
    renderCell: (value) =>
      renderValue(value, { key: "cep", required: true }, (val) => {
        const cep = val.replace(/\D/g, "");
        if (cep.length === 8) return `${cep.slice(0, 2)}.${cep.slice(2, 5)}-${cep.slice(5)}`;
        return val;
      }),
  });

  columnsMap.set("filial", {
    id: "filial",
    header: "Filial",
      renderCell: (value) =>
        renderValue(value, { key: "filial", required: true }, (val) => depsOptions?.filial?.find((opt) => opt.id === val)?.label ?? val),
  });

  return Array.from(columnsMap.values());
};