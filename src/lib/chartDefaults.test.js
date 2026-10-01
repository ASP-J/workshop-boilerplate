import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isIdentifyingColumn, pickDefaultChartColumns } from "./chartDefaults.js";
import { parseCsvText } from "./parseSheet.js";

describe("pickDefaultChartColumns", () => {
  it("nunca agrupa por e-mail: usa a primeira categoria e soma a primeira coluna numérica", () => {
    const rows = Array.from({ length: 30 }, (_, i) => ({
      email: `pessoa${i}@exemplo.com`,
      area: ["RH", "Vendas", "Financeiro"][i % 3],
      horas: i
    }));
    expect(pickDefaultChartColumns(["email", "area", "horas"], rows, ["horas"])).toEqual({ agrupar: "area", somar: "horas" });
  });

  it("pula colunas de nome, id e colunas com valores de e-mail mesmo sem 'email' no nome", () => {
    const rows = Array.from({ length: 20 }, (_, i) => ({
      id_colaborador: `C${i}`,
      nome: `Pessoa ${i}`,
      contato: `p${i}@exemplo.com`,
      status: i % 2 ? "Concluído" : "Pendente"
    }));
    const { agrupar, somar } = pickDefaultChartColumns(["id_colaborador", "nome", "contato", "status"], rows, []);
    expect(agrupar).toBe("status");
    expect(somar).toBe("");
    expect(isIdentifyingColumn("contato", rows)).toBe(true);
  });

  it("pula colunas de texto com valores quase todos diferentes (ex.: datas)", () => {
    const rows = Array.from({ length: 40 }, (_, i) => ({ data: `2026-01-${String(i).padStart(2, "0")}`, setor: i % 2 ? "A" : "B" }));
    expect(pickDefaultChartColumns(["data", "setor"], rows, []).agrupar).toBe("setor");
  });

  it("com a planilha do workshop, agrupa por area e soma horas_capacitacao", () => {
    const text = readFileSync(new URL("../../public/exemplos/capacitacao_workshop.csv", import.meta.url), "utf8");
    const sheet = parseCsvText(text);
    expect(pickDefaultChartColumns(sheet.columns, sheet.rows, sheet.numericColumns)).toEqual({ agrupar: "area", somar: "horas_capacitacao" });
  });
});
