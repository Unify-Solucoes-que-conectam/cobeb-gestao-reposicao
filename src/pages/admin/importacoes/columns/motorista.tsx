import { ColumnDef } from "@/components/custom/data-grid";
import dayjs from "@/lib/dayjs";
import { formatCPF } from "@/utils/formatters";
import { AlertCircle } from "lucide-react";
import { IMPORTER_CONFIGS, SelectOption } from "../config";

export type MotoristaRow = {
  cpf: string;
};

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

export const motoristaColumns = (depsOptions: Record<string, SelectOption<string>[]>): ColumnDef<MotoristaRow>[] => {
  const columns = IMPORTER_CONFIGS.find((c) => c.key === "motoristas")?.columns ?? [];
  const columnsMap = new Map<string, ColumnDef<MotoristaRow>>();

  columns.forEach((col) => {
    columnsMap.set(col.key, {
      id: col.key,
      header: col.header,
      renderCell: (value) => renderValue(value, col),
    });
  });

  columnsMap.set("cpf", {
    id: "cpf",
    header: "CPF",
    renderCell: (value) => renderValue(value, { key: "cpf", required: true }, (val) => formatCPF(val)),
  });

  columnsMap.set("codfilial", {
    id: "codfilial",
    header: "Filial",
    renderCell: (value) =>
      renderValue(value, { key: "codfilial", required: true }, (val) => depsOptions.filial?.find((opt) => opt.id === val)?.label ?? val),
  });

  columnsMap.set("codcluster", {
    id: "codcluster",
    header: "Cluster",
    renderCell: (value) =>
      renderValue(value, { key: "codcluster", required: true }, (val) => depsOptions.cluster?.find((opt) => opt.id === val)?.label ?? val),
  });

  columnsMap.set("data_admissao", {
    id: "data_admissao",
    header: "Data de Admissão",
    renderCell: (value) =>
      renderValue(value, { key: "data_admissao", required: true }, (val) => {
        const date = dayjs(val);
        return date.isValid() ? date.format("DD/MM/YYYY") : val;
      }),
  });

  columnsMap.set("data_inativacao", {
    id: "data_inativacao",
    header: "Data de Inativação",
    renderCell: (value) =>
      renderValue(value, { key: "data_inativacao" }, (val) => {
        const date = dayjs(val);
        return date.isValid() ? date.format("DD/MM/YYYY") : val === "" ? "-" : val;
      }),
  });

  return Array.from(columnsMap.values());
};