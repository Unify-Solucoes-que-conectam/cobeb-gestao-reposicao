import { excelDateToISO, type ImportTypes } from "./config";

/** Chaves dos registros no arquivo, sem consultar os cadastros da API. */
export function getImportDuplicateKey(type: ImportTypes, row: Record<string, string>): string | null {
  const value = (key: string) => String(row[key] ?? "").trim();
  let parts: string[];

  switch (type) {
    // Clientes, motoristas e mapas são únicos por filial (revenda).
    case "clientes": parts = [value("cod_pdv"), value("filial")]; break;
    case "produtos": parts = [value("codigo")]; break;
    case "motoristas": parts = [value("codmotorista"), value("codfilial")]; break;
    case "mapas": parts = [value("nro_do_mapa"), value("unb")]; break;
    case "vendas_trocas": {
      parts = [value("nota_fiscal"), value("produto")];
      const operation = Number(value("operacao"));
      if ([5, 39].includes(operation)) {
        let date = excelDateToISO(value("dt_operacao")) ?? "";
        const localDate = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(date);
        if (localDate) date = `${localDate[3]}-${localDate[2].padStart(2, "0")}-${localDate[1].padStart(2, "0")}`;
        parts.push(String(operation), date);
      } else {
        // Entradas e trocas do mesmo produto são movimentos distintos.
        parts.push("entrada");
      }
      break;
    }
  }

  // Campos ausentes são tratados pela validação de obrigatoriedade da prévia.
  if (parts.some(part => part === "")) return null;

  // O número da nota é único por filial (revenda): a mesma nota em clientes/filiais
  // diferentes não é duplicidade. A coluna Filial é opcional.
  if (type === "vendas_trocas") parts.unshift(value("cliente"), value("filial"));

  return JSON.stringify(parts);
}
