import { ColumnDef } from "@/components/custom/data-grid";
import dayjs from "@/lib/dayjs";
import { IMPORTER_CONFIGS, SelectOption } from "../config";
import { formatCurrency } from "@/utils/formatters";

export type VendaTrocaRow = {
  nota: string
}

export const vendaTrocasColumns = (_depsOptions: Record<string, SelectOption<string>[]>): ColumnDef<VendaTrocaRow>[] => {
  const columns = IMPORTER_CONFIGS.find((c) => c.key === "vendas_trocas")?.columns ?? [];

  const columnsMap = new Map<string, ColumnDef<VendaTrocaRow>>();

  // 1. Insere as colunas vindas da configuração
  columns.forEach((col) => {
    columnsMap.set(col.key, {
      id: col.key,
      header: col.header,
    });
  });

  columnsMap.set("nota_fiscal", {
    id: "nota",
    header: "Nota Fiscal",
    renderCell: (value: unknown) => value as string ?? "-",
  })

  columnsMap.set("operacao", {
    id: "operacao",
    header: "Operação",
    renderCell: (value: unknown) => value as string ?? "-",
  });

  columnsMap.set("dt_operacao", {
    id: "dt_operacao",
    header: "Data de Operação",
    renderCell: (value: unknown) => {

      if (value === null || value === undefined || value === "") return "-";

      const date = dayjs(value as string);
      return date.isValid() ? date.format("DD/MM/YYYY") : "-";
    },
  });

  columnsMap.set("emissao", {
    id: "emissao",
    header: "Data de Emissão",
    renderCell: (value: unknown) => {
      if (value === null || value === undefined || value === "") return "-";
      
      const date = dayjs(value as string);
      return date.isValid() ? date.format("DD/MM/YYYY") : "-";
    },
  });

  columnsMap.set("desconto", {
    id: "desconto",
    header: "Desconto",
    renderCell: (value: unknown) => formatCurrency(value as string) ?? "-",
  })

  columnsMap.set("adic_fina", {
    id: "adic_finan",
    header: "Adicional Financeiro",
    renderCell: (value: unknown) => formatCurrency(value as string) ?? "-",
  })

  columnsMap.set("total", {
    id: "total",
    header: "Total",
    renderCell: (value: unknown) => formatCurrency(value as string) ?? "-",
  })

  return Array.from(columnsMap.values());
};