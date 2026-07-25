import * as XLSX from "xlsx";

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

export interface ImporterConfig {
  key: string;
  label: string;
  columns: { header: string; key: string; example?: string }[];
  tableName: string;
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
  },
  {
    key: "mapas",
    label: "Mapas",
    tableName: "mapas",
    columns: [
      { header: "Nro do Mapa", key: "nro_mapa", example: "Número do mapa" },
      { header: "Motorista", key: "motorista", example: "Código do motorista" },
      { header: "UNB", key: "unb", example: "Código da Filial" },
      { header: "Data Entrega", key: "data_entrega", example: "Data de entrega do mapa" },
      { header: "Placa do Veículo", key: "placa_veiculo", example: "Placa do veículo" },
      { header: "Clientes", key: "clientes", example: "Códigos dos clientes (separados por /)" },
    ],
  },
  {
    key: "vendas_trocas",
    label: "Vendas e Trocas",
    tableName: "vendas_trocas",
    columns: [
      { header: "Nota Fiscal", key: "nota_fiscal", example: "Número da nota fiscal" },
      { header: "Nr. Pedido", key: "nr_pedido", example: "Número do pedido" },
      { header: "Cliente", key: "cliente", example: "Código do cliente" },
      { header: "Operação", key: "operacao", example: "Tipo de operação (Venda ou Troca)" },
      { header: "Emissão", key: "emissao", example: "Data de emissão da nota fiscal" },
      { header: "Produto", key: "produto", example: "Código do produto" },
      { header: "Qtde", key: "quantidade", example: "Quantidade do produto" },
      { header: "Desconto", key: "desconto", example: "Desconto aplicado ao produto" },
      { header: "Adic. Fina", key: "adic_fina", example: "Adicional financeiro aplicado ao produto" },
      { header: "Total", key: "total", example: "Total do produto" },
    ],
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
