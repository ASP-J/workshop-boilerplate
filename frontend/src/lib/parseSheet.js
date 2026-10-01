// =============================================================================
// Lê uma planilha (CSV ou XLSX) e devolve sempre o mesmo formato:
//   { columns: ["nome", "email", ...], rows: [{ nome: "Ana", email: "..." }, ...], numericColumns: ["horas"] }
//
// - Os nomes das colunas são "normalizados": minúsculas, sem acento, espaços viram "_".
//   Ex.: "Centro de Custo" -> "centro_de_custo"
// - Números no formato brasileiro ("1.234,56") viram número de verdade (1234.56).
// - Tudo acontece NO NAVEGADOR: o arquivo nunca sai do seu computador.
// =============================================================================
import Papa from "papaparse";

/** "Centro de Custo " -> "centro_de_custo" */
export function normalizeHeader(header, index = 0) {
  const text = String(header ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return text || `coluna_${index + 1}`;
}

/** Converte "1.234,56", "R$ 10", "12.5" em número. Devolve null se não for número. */
export function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  let text = String(value ?? "").trim().replace(/^R\$\s*/i, "").replace(/\s/g, "");
  if (!text || !/^-?[\d.,]+$/.test(text)) return null;
  if (text.includes(",")) text = text.replace(/\./g, "").replace(",", "."); // formato BR
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(text)) text = text.replace(/\./g, ""); // 1.234 = mil
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

/** Transforma uma matriz (primeira linha = cabeçalho) em { columns, rows, numericColumns }. */
export function fromMatrix(matrix) {
  const [headerRow = [], ...body] = (matrix ?? []).filter((row) => row && row.some((cell) => String(cell ?? "").trim() !== ""));
  const columns = uniqueColumns(headerRow.map((h, i) => normalizeHeader(h, i)));

  const rows = body.map((cells) => {
    const row = {};
    columns.forEach((column, i) => {
      const cell = cells[i];
      row[column] = cell instanceof Date ? cell.toISOString().slice(0, 10) : String(cell ?? "").trim();
    });
    return row;
  });

  const numericColumns = columns.filter((column) => {
    const filled = rows.map((r) => r[column]).filter((v) => v !== "");
    return filled.length > 0 && filled.every((v) => toNumber(v) !== null);
  });

  for (const row of rows) {
    for (const column of numericColumns) row[column] = row[column] === "" ? null : toNumber(row[column]);
  }

  return { columns, rows, numericColumns };
}

/** Lê um texto CSV (aceita vírgula ou ponto e vírgula). */
export function parseCsvText(text) {
  const result = Papa.parse(String(text ?? "").replace(/^﻿/, ""), { skipEmptyLines: "greedy" });
  return fromMatrix(result.data);
}

/** Lê um arquivo escolhido pela pessoa (File do navegador). */
export async function parseSheetFile(file) {
  const name = (file?.name ?? "").toLowerCase();
  if (name.endsWith(".csv") || name.endsWith(".txt")) return parseCsvText(await file.text());
  if (name.endsWith(".xlsx")) {
    // Carregado só quando precisa, para a tela abrir mais rápido.
    const { readSheet } = await import("read-excel-file/browser");
    return fromMatrix(await readSheet(file));
  }
  throw new Error("Formato não suportado. Use um arquivo .csv ou .xlsx (no Excel: Arquivo > Salvar como > CSV).");
}

function uniqueColumns(columns) {
  const seen = {};
  return columns.map((column) => {
    seen[column] = (seen[column] ?? 0) + 1;
    return seen[column] === 1 ? column : `${column}_${seen[column]}`;
  });
}
