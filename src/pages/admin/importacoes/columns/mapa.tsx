import { ColumnDef } from "@/components/custom/data-grid";
import dayjs from "@/lib/dayjs";
import { AlertCircle } from "lucide-react";
import { IMPORTER_CONFIGS, SelectOption } from "../config";

export type MapaRow = Record<string, unknown>;

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

export const mapaColumns = (depsOptions: Record<string, SelectOption<string>[]>): ColumnDef<MapaRow>[] => {
  const columns = IMPORTER_CONFIGS.find((c) => c.key === "mapas")?.columns ?? [];
  const columnsMap = new Map<string, ColumnDef<MapaRow>>();

  columns.forEach((col) => {
    columnsMap.set(col.key, {
      id: col.key,
      header: col.header,
      renderCell: (value) => renderValue(value, col),
    });
  });

  columnsMap.set("unb", {
    id: "unb",
    header: "UNB",
    renderCell: (value) =>
      renderValue(value, { key: "unb", required: true }, (val) => depsOptions.filial?.find((opt) => opt.id === val)?.label ?? val),
  });

  columnsMap.set("data_entrega", {
    id: "data_entrega",
    header: "Data Entrega",
    renderCell: (value) =>
      renderValue(value, { key: "data_entrega", required: true }, (val) => {
        const date = dayjs(val);
        return date.isValid() ? date.format("DD/MM/YYYY") : val;
      }),
  });

  columnsMap.set("placa_veiculo", {
    id: "placa_veiculo",
    header: "Placa do Veículo",
    renderCell: (value) => renderValue(value, { key: "placa_veiculo", required: true }, (val) => val.toUpperCase()),
  });

  return Array.from(columnsMap.values());
};