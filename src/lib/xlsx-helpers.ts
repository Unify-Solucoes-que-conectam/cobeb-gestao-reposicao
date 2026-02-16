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
    key: "filiais",
    label: "Filiais",
    tableName: "filiais",
    columns: [
      { header: "Código", key: "codigo", example: "F001" },
      { header: "Descrição", key: "descricao", example: "Filial Centro" },
    ],
  },
  {
    key: "clusters",
    label: "Clusters",
    tableName: "clusters",
    columns: [
      { header: "Código", key: "codigo", example: "C001" },
      { header: "Descrição", key: "descricao", example: "Cluster Norte" },
    ],
  },
  {
    key: "tipos_marca",
    label: "Tipos de Marca",
    tableName: "tipos_marca",
    columns: [
      { header: "Código", key: "codigo", example: "TM01" },
      { header: "Descrição", key: "descricao", example: "Marca Própria" },
    ],
  },
  {
    key: "embalagens",
    label: "Embalagens",
    tableName: "embalagens",
    columns: [
      { header: "Código", key: "codigo", example: "EMB01" },
      { header: "Descrição", key: "descricao", example: "Lata 350ml" },
    ],
  },
  {
    key: "categorias",
    label: "Categorias",
    tableName: "categorias",
    columns: [
      { header: "Código", key: "codigo", example: "CAT01" },
      { header: "Descrição", key: "descricao", example: "Bar" },
    ],
  },
  {
    key: "tipos_pessoa",
    label: "Tipos de Pessoa",
    tableName: "tipos_pessoa",
    columns: [
      { header: "Código", key: "codigo", example: "PJ" },
      { header: "Descrição", key: "descricao", example: "Pessoa Jurídica" },
    ],
  },
  {
    key: "clientes",
    label: "Clientes",
    tableName: "clients",
    columns: [
      { header: "Código", key: "code", example: "CLI001" },
      { header: "Documento", key: "documento", example: "12.345.678/0001-90" },
      { header: "Nome Fantasia", key: "nome_fantasia", example: "Bar do João" },
      { header: "Razão Social", key: "razao_social", example: "João Silva LTDA" },
      { header: "Endereço", key: "address", example: "Rua A, 123" },
      { header: "Complemento", key: "complemento", example: "Sala 1" },
      { header: "Bairro", key: "bairro", example: "Centro" },
      { header: "Cidade", key: "cidade", example: "São Paulo" },
      { header: "UF", key: "uf", example: "SP" },
      { header: "CEP", key: "cep", example: "01000-000" },
      { header: "Latitude", key: "latitude", example: "-23.55052" },
      { header: "Longitude", key: "longitude", example: "-46.63331" },
      { header: "Categoria (Código)", key: "categoria_codigo", example: "CAT01" },
      { header: "Tipo Pessoa (Código)", key: "tipo_pessoa_codigo", example: "PJ" },
      { header: "PDV Ativo (S/N)", key: "pdv_ativo", example: "S" },
      { header: "Telefone", key: "telefone", example: "11999999999" },
      { header: "Telefone Principal (S/N)", key: "telefone_principal", example: "S" },
    ],
  },
  {
    key: "produtos",
    label: "Produtos",
    tableName: "products",
    columns: [
      { header: "Código", key: "code", example: "PRD001" },
      { header: "Nome", key: "name", example: "Cerveja Pilsen 350ml" },
      { header: "Descrição", key: "descricao", example: "Cerveja tipo pilsen em lata" },
      { header: "Quantidade (Embalagem)", key: "quantidade", example: "12" },
      { header: "Tipo Marca (Código)", key: "tipo_marca_codigo", example: "TM01" },
      { header: "Embalagem (Código)", key: "embalagem_codigo", example: "EMB01" },
      { header: "EAN", key: "ean", example: "7891234567890" },
    ],
  },
  {
    key: "motoristas",
    label: "Motoristas",
    tableName: "profiles",
    columns: [
      { header: "Código", key: "codigo", example: "MOT001" },
      { header: "Nome", key: "name", example: "José Silva" },
      { header: "CPF", key: "cpf", example: "12345678900" },
      { header: "Status", key: "status", example: "ativo" },
      { header: "Celular Corporativo", key: "celular_corporativo", example: "11988887777" },
      { header: "Data Admissão", key: "data_admissao", example: "2024-01-15" },
      { header: "Filial (Código)", key: "filial_codigo", example: "F001" },
      { header: "Cluster (Código)", key: "cluster_codigo", example: "C001" },
      { header: "Senha", key: "senha", example: "" },
    ],
  },
  {
    key: "notas_fiscais",
    label: "Notas Fiscais",
    tableName: "invoices",
    columns: [
      { header: "Número NF", key: "number", example: "NF001" },
      { header: "Pedido", key: "pedido", example: "PED001" },
      { header: "Mapa", key: "mapa", example: "MAPA01" },
      { header: "Cliente (Código)", key: "cliente_codigo", example: "CLI001" },
      { header: "Rota", key: "rota_nome", example: "ROTA-01" },
      { header: "Data Operação", key: "data_operacao", example: "2024-01-15" },
      { header: "Data Emissão", key: "data_emissao", example: "2024-01-15" },
      { header: "Valor Bruto", key: "valor_bruto", example: "1500.00" },
      { header: "Total Desconto", key: "total_desconto", example: "100.00" },
      { header: "Valor Total", key: "total_value", example: "1400.00" },
      { header: "Status", key: "status", example: "ativa" },
    ],
  },
  {
    key: "produtos_nf",
    label: "Produtos da NF",
    tableName: "invoice_products",
    columns: [
      { header: "NF (Número)", key: "nf_numero", example: "NF001" },
      { header: "Produto (Código)", key: "produto_codigo", example: "PRD001" },
      { header: "Quantidade", key: "quantity", example: "10" },
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
