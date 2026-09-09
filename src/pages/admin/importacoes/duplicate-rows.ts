import { excelDateToISO, type ImportTypes } from "./config";

/** Chaves dos registros no arquivo, sem consultar os cadastros da API. */
export function getImportDuplicateKey(type: ImportTypes, row: Record<string, string>): string | null {
  const value = (key: string) => String(row[key] ?? "").trim();
  let parts: string[];

  switch (type) {
    case "clientes": parts = [value("cod_pdv")]; break;
    case "produtos": parts = [value("codigo")]; break;
    case "motoristas": parts = [value("codmotorista")]; break;
    case "mapas": parts = [value("nro_do_mapa")]; break;
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
  return parts.some(part => part === "") ? null : JSON.stringify(parts);
}
