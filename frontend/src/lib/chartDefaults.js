// =============================================================================
// Escolhe as colunas padrão do gráfico da página "Minha planilha".
//
//   pickDefaultChartColumns(columns, rows, numericColumns)
//   -> { agrupar: "area", somar: "horas_capacitacao" }
//
// Por quê: agrupar por e-mail, nome ou id gera um gráfico com uma barra por
// pessoa (inútil) e ainda expõe dados pessoais na tela. Então o padrão é a
// primeira coluna de CATEGORIA (poucos valores repetidos, ex.: área, status)
// que não identifica ninguém, e a soma é a primeira coluna numérica.
// =============================================================================

// Nomes de coluna que identificam uma pessoa ou registro (já normalizados: minúsculas, "_").
const IDENTIFYING_NAME = /(^|_)(id|ids|codigo|cod|e_?mail|email|nome|name|cpf|cnpj|rg|telefone|celular|phone|matricula|usuario|user|login|documento)(_|$)/;
const LOOKS_LIKE_EMAIL = /\S+@\S+\.\S+/;

/** Diz se a coluna parece identificar alguém (pelo nome ou porque os valores são e-mails). */
export function isIdentifyingColumn(column, rows = []) {
  if (IDENTIFYING_NAME.test(String(column ?? ""))) return true;
  return rows.slice(0, 20).some((row) => LOOKS_LIKE_EMAIL.test(String(row?.[column] ?? "")));
}

/** Coluna de categoria = poucos valores diferentes que se repetem (ex.: área, status). */
export function isCategoricalColumn(column, rows = []) {
  const values = rows.map((row) => String(row?.[column] ?? "").trim()).filter(Boolean);
  if (!values.length) return false;
  const distinct = new Set(values).size;
  if (values.length < 10) return true; // planilha pequena: qualquer texto serve
  return distinct <= 50 && distinct <= values.length * 0.5;
}

export function pickDefaultChartColumns(columns = [], rows = [], numericColumns = []) {
  const textColumns = columns.filter((c) => !numericColumns.includes(c));
  const safeText = textColumns.filter((c) => !isIdentifyingColumn(c, rows));
  const agrupar =
    safeText.find((c) => isCategoricalColumn(c, rows)) ??
    safeText[0] ??
    columns.find((c) => !isIdentifyingColumn(c, rows)) ??
    columns[0] ??
    "";
  const somar = numericColumns.find((c) => c !== agrupar && !isIdentifyingColumn(c, rows)) ?? "";
  return { agrupar, somar };
}
