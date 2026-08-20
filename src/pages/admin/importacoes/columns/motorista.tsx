import { ColumnDef } from "@/components/custom/data-grid";
import dayjs from "@/lib/dayjs";
import { formatCPF } from "@/utils/formatters";
import { IMPORTER_CONFIGS, SelectOption } from "../config";

export type MotoristaRow = {
  cpf: string;
}

export const motoristaColumns = (depsOptions: Record<string, SelectOption<string>[]>): ColumnDef<MotoristaRow>[] => {
  const columns = IMPORTER_CONFIGS.find((c) => c.key === "motoristas")?.columns ?? [];

  const columnsMap = new Map<string, ColumnDef<MotoristaRow>>();

  // 1. Insere as colunas vindas da configuração
  columns.forEach((col) => {
    columnsMap.set(col.key, {
      id: col.key,
      header: col.header,
    });
  });

  // 2. Sobrescreve ou adiciona as declarações manuais (o último .set prevalece)
  columnsMap.set("cpf", {
    id: "cpf",
    header: "CPF",
    renderCell: (value: unknown) => formatCPF(value as string),
  });

  columnsMap.set("codfilial", {
    id: "codfilial",
    header: "Filial",
    renderCell: (value: unknown) => depsOptions.filial?.find((opt) => opt.id === value)?.label ?? "-",
  });

  columnsMap.set("codcluster", {
    id: "codcluster",
    header: "Cluster",
    renderCell: (value: unknown) => depsOptions.cluster?.find((opt) => opt.id === value)?.label ?? "-",
  });

  columnsMap.set("data_admissao", {
    id: "data_admissao",
    header: "Data de Admissão",
    renderCell: (value: unknown) => {

      if (value === null || value === undefined || value === "") return "-";
      
      const date = dayjs(value as string);
      return date.isValid() ? date.format("DD/MM/YYYY") : "-";
    },
  });

  columnsMap.set("data_inativacao", {
    id: "data_inativacao",
    header: "Data de Inativação",
    renderCell: (value: unknown) => {

      if (value === null || value === undefined || value === "") return "-";

      const date = dayjs(value as string);
      return date.isValid() ? date.format("DD/MM/YYYY") : "-";
    },
  });

  return Array.from(columnsMap.values());
};