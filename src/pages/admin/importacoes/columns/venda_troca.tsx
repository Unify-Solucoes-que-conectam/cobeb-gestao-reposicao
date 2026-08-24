import { ColumnDef } from "@/components/custom/data-grid";
import dayjs from "@/lib/dayjs";
import { formatCurrency } from "@/utils/formatters";
import { AlertCircle } from "lucide-react";
import { SelectOption } from "../config";

export type VendaTrocaRow = {
  nota_fiscal: string;
  nr_pedido: string;
  cliente: string;
  dt_operacao: string;
  operacao: string;
  emissao: string;
  produto: string;
  quantidade: string;
  desconto: string;
  adic_fina: string;
  total: string;
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

export const vendaTrocasColumns = (_depsOptions: Record<string, SelectOption<string>[]>): ColumnDef<VendaTrocaRow>[] => {
  return [
    {
      id: "nota_fiscal",
      header: "Nota",
      renderCell: (value) => renderValue(value, { key: "nota_fiscal", required: true }),
    },
    {
      id: "nr_pedido",
      header: "Nr. Pedido",
      renderCell: (value) => renderValue(value, { key: "nr_pedido", required: true }),
    },
    {
      id: "cliente",
      header: "Cliente",
      renderCell: (value) => renderValue(value, { key: "cliente", required: true }),
    },
    {
      id: "dt_operacao",
      header: "Dt. Operação",
      renderCell: (value) =>
        renderValue(value, { key: "dt_operacao", required: true }, (val) => {
          const date = dayjs(val);
          return date.isValid() ? date.format("DD/MM/YYYY") : val;
        }),
    },
    {
      id: "operacao",
      header: "Operação",
      renderCell: (value) => renderValue(value, { key: "operacao", required: true }),
    },
    {
      id: "emissao",
      header: "Emissão",
      renderCell: (value) =>
        renderValue(value, { key: "emissao", required: true }, (val) => {
          const date = dayjs(val);
          return date.isValid() ? date.format("DD/MM/YYYY") : val;
        }),
    },
    {
      id: "produto",
      header: "Produto",
      renderCell: (value) => renderValue(value, { key: "produto", required: true }),
    },
    {
      id: "quantidade",
      header: "Quantidade",
      renderCell: (value) => renderValue(value, { key: "quantidade", required: true }),
    },
    {
      id: "desconto",
      header: "Desconto",
      renderCell: (value) => renderValue(value, { key: "desconto", required: true }, (val) => formatCurrency(val)),
    },
    {
      id: "adic_fina",
      header: "Adic. Fina",
      renderCell: (value) => renderValue(value, { key: "adic_fina", required: true }, (val) => formatCurrency(val)),
    },
    {
      id: "total",
      header: "Total",
      renderCell: (value) => renderValue(value, { key: "total", required: true }, (val) => formatCurrency(val)),
    },
  ];
};