import { ColumnDef } from "@/components/custom/data-grid";
import { motoristaColumns } from "@/pages/admin/importacoes/columns/motorista";
import { clienteService, clusterService, filialService } from "@/services/api.service";
import * as XLSX from "xlsx";
import { clienteColumns } from "./columns/cliente";
import { mapaColumns } from "./columns/mapa";
import { produtoColumns } from "./columns/produto";
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
  columns: { header: string; key: string; example?: string; required?: boolean }[];
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
      { header: "Cód PDV", key: "cod_pdv", example: "Código do PDV", required: true },
      { header: "Documento", key: "documento", example: "Número do documento" },
      { header: "Nome Fantasia", key: "nome_fantasia", example: "Nome fantasia do cliente" },
      { header: "Razão Social", key: "razao_social", example: "Razão social do cliente", required: true },
      { header: "Endereço", key: "endereco", example: "Endereço do cliente", required: true },
      { header: "Complemento", key: "complemento", example: "Complemento do endereço" },
      { header: "Bairro", key: "bairro", example: "Bairro do cliente", required: true },
      { header: "Cidade", key: "cidade", example: "Cidade do cliente", required: true },
      { header: "UF", key: "uf", example: "Estado do cliente", required: true },
      { header: "CEP", key: "cep", example: "CEP do cliente" },
      { header: "Filial", key: "filial", example: "Filial do cliente", required: true },
      { header: "Categoria", key: "categoria", example: "Categoria do cliente", required: true },
      { header: "Tipo de Pessoa", key: "tipo_pessoa", example: "Tipo de pessoa do cliente" },
      { header: "Status do PDV", key: "status", example: "Status do PDV" },
      { header: "Telefone(s)", key: "telefones", example: "Telefone(s) do cliente (separados por | )" },
    ],
    columnsDef: clienteColumns,
    deps: {
      filial: (): Promise<SelectOption<string>[]> =>
        filialService.read({}).then(res => (res.data.map(f => ({ id: f.codigo, label: f.descricao })))),
    }
  },
  {
    key: "produtos",
    label: "Produtos",
    tableName: "produtos",
    columns: [
      { header: "Código", key: "codigo", example: "Código do produto", required: true },
      { header: "EAN", key: "ean", example: "Código EAN do produto" },
      { header: "Descrição", key: "descricao", example: "Descrição do produto", required: true },
      { header: "Tipo Marca", key: "tipo_marca", example: "Tipo de Marca", required: true },
      { header: "Embalagem", key: "embalagem", example: "Embalagem do produto", required: true },
    ],
    columnsDef: produtoColumns
  },
  {
    key: "motoristas",
    label: "Motoristas",
    tableName: "motoristas",
    columns: [
      { header: "CPF", key: "cpf", example: "CPF do motorista", required: true },
      { header: "Cód.Motorista", key: "codmotorista", example: "Código do motorista", required: true },
      { header: "Nome Motorista", key: "nome_motorista", example: "Nome do motorista", required: true },
      { header: "Cód.Cluster", key: "codcluster", example: "Código do cluster", required: true },
      { header: "Cluster", key: "cluster", example: "Descrição do cluster", required: true },
      { header: "Cód.Filial", key: "codfilial", example: "Código da filial", required: true },
      { header: "Data Admissão", key: "data_admissao", example: "Data de admissão do motorista" },
      { header: "Data Inativação", key: "data_inativacao", example: "Data de inativação do motorista" },
      { header: "Status", key: "status", example: "Status do motorista" },
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
      { header: "Nro do Mapa", key: "nro_do_mapa", example: "Número do mapa", required: true },
      { header: "Motorista", key: "motorista", example: "Código do motorista", required: true },
      { header: "UNB", key: "unb", example: "Código da Filial", required: true },
      { header: "Data Entrega", key: "data_entrega", example: "Data de entrega do mapa", required: true },
      { header: "Placa", key: "placa", example: "Placa do veículo", required: true },
      { header: "Clientes", key: "clientes", example: "Códigos dos clientes (separados por /)", required: true },
    ],
    columnsDef: mapaColumns,
    deps: {
      clientes: (): Promise<SelectOption<string>[]> =>
        clienteService.read({}).then(res => (res.data.map(c => ({ id: c.codigo, label: c.razao_social })))),
    }
  },
  {
    key: "vendas_trocas",
    label: "Vendas e Trocas - Rotina [03.02.37]",
    tableName: "vendas_trocas",
    columns: [
      { header: "Nota", key: "nota_fiscal", example: "Número da nota fiscal", required: true },
      { header: "Nr. Pedido", key: "nr_pedido", example: "Número do pedido", required: true },
      { header: "Cliente", key: "cliente", example: "Código do cliente", required: true },
      { header: "Dt. Operação", key: "dt_operacao", example: "Data da operação (Venda ou Troca)", required: true },
      { header: "Operação", key: "operacao", example: "Tipo de operação (Venda ou Troca)", required: true },
      { header: "Emissão", key: "emissao", example: "Data de emissão da nota fiscal", required: true },
      { header: "Produto", key: "produto", example: "Código do produto", required: true },
      { header: "Qtde", key: "quantidade", example: "Quantidade do produto", required: true },
      { header: "Desconto", key: "desconto", example: "Desconto aplicado ao produto", required: true },
      { header: "Adic. Finan", key: "adic_fina", example: "Adicional financeiro aplicado ao produto", required: true },
      { header: "Total", key: "total", example: "Total do produto", required: true },
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

function normalizeHeader(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // Remove pontos, espaços e caracteres especiais
}

export function parseXlsxMapped(file: File, config: ImporterConfig): Promise<Record<string, string>[]> {
  // Mapeia tanto pelo header quanto pela key para garantir compatibilidade
  const headerToKey: Record<string, string> = {};
  config.columns.forEach((c) => {
    headerToKey[normalizeHeader(c.header)] = c.key;
    headerToKey[normalizeHeader(c.key)] = c.key;
  });

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
            const normalizedExcelHeader = normalizeHeader(excelHeader);
            const key = headerToKey[normalizedExcelHeader] ?? normalizedExcelHeader;
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