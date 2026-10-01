// =============================================================================
// Gera um CSV (abre no Excel) a partir de linhas e baixa no computador.
//   toCsv(rows, columns)            -> texto CSV
//   downloadCsv("arquivo.csv", rows, columns)  -> baixa o arquivo
// Usa ";" como separador porque o Excel em português espera isso.
// =============================================================================

export function escapeCell(value, separator = ";") {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /["\n\r]/.test(text) || text.includes(separator) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows, columns, separator = ";") {
  const cols = columns?.length ? columns : Object.keys(rows?.[0] ?? {});
  const lines = [cols.map((c) => escapeCell(c, separator)).join(separator)];
  for (const row of rows ?? []) lines.push(cols.map((c) => escapeCell(row?.[c], separator)).join(separator));
  return lines.join("\r\n");
}

export function downloadCsv(filename, rows, columns) {
  // "﻿" faz o Excel entender os acentos.
  const blob = new Blob(["﻿" + toCsv(rows, columns)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
