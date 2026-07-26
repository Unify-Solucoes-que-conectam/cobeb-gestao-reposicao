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
      { header: "Nome", key: "nome", example: "João da Silva" },
    ],
  },
  {
    key: "produtos",
    label: "Produtos",
    tableName: "produtos",
    columns: [],
  },
  {
    key: "motoristas",
    label: "Motoristas",
    tableName: "motoristas",
    columns: [],
  },
  {
    key: "mapas",
    label: "Mapas",
    tableName: "mapas",
    columns: [],
  },
  {
    key: "vendas_trocas",
    label: "Vendas e Trocas",
    tableName: "vendas_trocas",
    columns: [],
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
