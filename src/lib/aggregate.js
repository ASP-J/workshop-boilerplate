// =============================================================================
// Contas simples em cima das linhas de uma planilha.
//   groupBy(rows, "setor")                 -> [{ name: "RH", value: 12 }, ...]  (conta linhas)
//   groupBy(rows, "setor", "horas")        -> [{ name: "RH", value: 80 }, ...]  (soma "horas")
//   sum(rows, "valor"), average(rows, "valor"), countBy(rows, "status")
// =============================================================================

export function sum(rows, column) {
  return (rows ?? []).reduce((total, row) => total + (Number.isFinite(Number(row?.[column])) && row?.[column] !== null && row?.[column] !== "" ? Number(row[column]) : 0), 0);
}

export function average(rows, column) {
  const values = (rows ?? []).map((row) => row?.[column]).filter((v) => v !== null && v !== "" && Number.isFinite(Number(v)));
  return values.length ? values.reduce((a, b) => a + Number(b), 0) / values.length : 0;
}

/** Agrupa por uma coluna. Sem valueColumn conta linhas; com valueColumn soma. Ordena do maior para o menor. */
export function groupBy(rows, column, valueColumn = null, { limit = 0 } = {}) {
  const totals = new Map();
  for (const row of rows ?? []) {
    const key = String(row?.[column] ?? "").trim() || "(vazio)";
    const raw = valueColumn ? Number(row?.[valueColumn]) : 1;
    const add = Number.isFinite(raw) ? raw : 0;
    totals.set(key, (totals.get(key) ?? 0) + add);
  }
  const result = [...totals.entries()]
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  return limit > 0 ? result.slice(0, limit) : result;
}

/** Atalho: conta quantas linhas há para cada valor da coluna. */
export function countBy(rows, column) {
  return groupBy(rows, column);
}

/** Formata número no padrão brasileiro: 1234.5 -> "1.234,5" */
export function formatNumber(value, decimals = 2) {
  return Number(value ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: decimals });
}
