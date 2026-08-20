import { ColumnDef } from "@/components/custom/data-grid";
import { motoristaColumns } from "@/pages/admin/importacoes/columns/motorista";
import { clusterService, filialService } from "@/services/api.service";
import { snakeCase } from "change-case";
import * as XLSX from "xlsx";
import { vendaTrocasColumns } from "./columns/venda_troca";

export function excelDateToISO(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  const str = String(value).trim();
  if (!str) return null;
  const num = Number(str);
  if (!isNaN(num) && num > 10000) {
    // Excel serial date: days since 1899-12-30
    const date = new Date((num - 25569) * 86400 * 1000);
    return date.toISOString().split("T")[0];
  }
  // Already a date string
  return str;
}

export type ImportTypes = "clientes" | "produtos" | "motoristas" | "mapas" | "vendas_trocas";

export interface SelectOption<TId = string> {
  id: TId;
  label: string;
}

export type AsyncOptionLoader<TId = string> = () => Promise<SelectOption<TId>[]>;

export type DepsConfig = Record<string, AsyncOptionLoader>;

export type ImporterConfig = {
  key: ImportTypes;
  label: string;
  columns: { header: string; key: string; example?: string }[];
  tableName: string;
  columnsDef: (depsOptions: Record<string, SelectOption<string>[]>) => ColumnDef<any>[];
  deps?: DepsConfig;
}

export const IMPORTER_CONFIGS: ImporterConfig[] = [
  {
    key: "clientes",
    label: "Clientes",
    tableName: "clientes",
    columns: [
      { header: "Cód PDV", key: "cod_pdv", example: "Código do PDV" },
      { header: "Documento", key: "documento", example: "Número do documento" },
      { header: "Nome Fantasia", key: "nome_fantasia", example: "Nome fantasia do cliente" },
      { header: "Razão Social", key: "razao_social", example: "Razão social do cliente" },
      { header: "Endereço", key: "endereco", example: "Endereço do cliente" },
      { header: "Complemento", key: "complemento", example: "Complemento do endereço" },
      { header: "Bairro", key: "bairro", example: "Bairro do cliente" },
      { header: "Cidade", key: "cidade", example: "Cidade do cliente" },
      { header: "UF", key: "uf", example: "Estado do cliente" },
      { header: "CEP", key: "cep", example: "CEP do cliente" },
      { header: "Filial", key: "filial", example: "Filial do cliente" },
      { header: "Categoria", key: "categoria", example: "Categoria do cliente" },
      { header: "Tipo de Pessoa", key: "tipo_pessoa", example: "Tipo de pessoa do cliente" },
      { header: "Status do PDV", key: "status", example: "Status do PDV" },
      { header: "Telefone(s)", key: "telefones", example: "Telefone(s) do cliente (separados por | )" },
    ],
    columnsDef: motoristaColumns
  },
  {
    key: "produtos",
    label: "Produtos",
    tableName: "produtos",
    columns: [
      { header: "Código", key: "codigo", example: "Código do produto" },
      { header: "EAN", key: "ean", example: "Código EAN do produto" },
      { header: "Descrição", key: "descricao", example: "Descrição do produto" },
      { header: "Tipo Marca", key: "tipo_marca", example: "Tipo de Marca" },
      { header: "Embalagem", key: "embalagem", example: "Embalagem do produto" },
    ],
    columnsDef: motoristaColumns
  },
  {
    key: "motoristas",
    label: "Motoristas",
    tableName: "motoristas",
    columns: [
      { header: "CPF", key: "cpf", example: "CPF do motorista" },
      { header: "Cód.Motorista", key: "codmotorista", example: "Código do motorista" },
      { header: "Nome Motorista", key: "nome_motorista", example: "Nome do motorista" },
      { header: "Cód.Cluster", key: "codcluster", example: "Código do cluster" },
      { header: "Cód.Filial", key: "codfilial", example: "Código da filial" },
      { header: "Data Admissão", key: "data_admissao", example: "Data de admissão do motorista" },
      { header: "Data Inativação", key: "data_inativacao", example: "Data de inativação do motorista" },
    ],
    columnsDef: motoristaColumns,
    deps: {
      cluster: (): Promise<SelectOption<string>[]> =>
        clusterService.read({}).then(res => (res.data.map(c => ({ id: c.codigo, label: c.descricao })))),
      filial: (): Promise<SelectOption<string>[]> =>
        filialService.read({}).then(res => (res.data.map(f => ({ id: f.codigo, label: f.descricao })))),
    }
  },
  {
    key: "mapas",
    label: "Mapas - Rotina [03.01.49]",
    tableName: "mapas",
    columns: [
      { header: "Nro do Mapa", key: "nro_mapa", example: "Número do mapa" },
      { header: "Motorista", key: "motorista", example: "Código do motorista" },
      { header: "UNB", key: "unb", example: "Código da Filial" },
      { header: "Data Entrega", key: "data_entrega", example: "Data de entrega do mapa" },
      { header: "Placa do Veículo", key: "placa_veiculo", example: "Placa do veículo" },
      { header: "Clientes", key: "clientes", example: "Códigos dos clientes (separados por /)" },
    ],
    columnsDef: motoristaColumns
  },
  {
    key: "vendas_trocas",
    label: "Vendas e Trocas - Rotina [03.02.37]",
    tableName: "vendas_trocas",
    columns: [
      { header: "Nota Fiscal", key: "nota_fiscal", example: "Número da nota fiscal" },
      { header: "Nr. Pedido", key: "nr_pedido", example: "Número do pedido" },
      { header: "Cliente", key: "cliente", example: "Código do cliente" },
      { header: "Dt. Operação", key: "dt_operacao", example: "Data da operação (Venda ou Troca)" },
      { header: "Operação", key: "operacao", example: "Tipo de operação (Venda ou Troca)" },
      { header: "Emissão", key: "emissao", example: "Data de emissão da nota fiscal" },
      { header: "Produto", key: "produto", example: "Código do produto" },
      { header: "Qtde", key: "quantidade", example: "Quantidade do produto" },
      { header: "Desconto", key: "desconto", example: "Desconto aplicado ao produto" },
      { header: "Adic. Fina", key: "adic_fina", example: "Adicional financeiro aplicado ao produto" },
      { header: "Total", key: "total", example: "Total do produto" },
    ],
    columnsDef: vendaTrocasColumns
  },
];

export function generateTemplate(config: ImporterConfig): void {
  const headers = config.columns.map((c) => c.header);
  const examples = config.columns.map((c) => c.example || "");

  const ws = XLSX.utils.aoa_to_sheet([headers, examples]);

  // Set column widths
  ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 4, 15) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, config.label);
  XLSX.writeFile(wb, `template_${config.key}.xlsx`);
}

export function parseXlsx(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Parses xlsx and remaps Excel headers to ImporterConfig keys
// CPF must be 11 digits — Excel silently strips leading zeros
function normalizeCPF(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0 || digits.length > 11) return value;
  return digits.padStart(11, "0");
}

const CPF_KEYS = new Set(["cpf"]);

export function parseXlsxMapped(file: File, config: ImporterConfig): Promise<Record<string, string>[]> {
  // Cria mapeamento normalizando ambos os lados
  const headerToKey: Record<string, string> = Object.fromEntries(
    config.columns.map((c) => [snakeCase(c.header), c.key])
  );

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

        const mapped = rows.map((row) => {
          const out: Record<string, string> = {};
          for (const [excelHeader, value] of Object.entries(row)) {
            const normalizedHeader = snakeCase(excelHeader);
            const key = headerToKey[normalizedHeader] ?? normalizedHeader;
            const raw = String(value ?? "");
            out[key] = CPF_KEYS.has(key) ? normalizeCPF(raw) : raw;
          }
          return out;
        });

        resolve(mapped);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
