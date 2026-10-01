import { describe, expect, it } from "vitest";
import { daCozinha, formatarData, MAX_LINHAS_SALVAR, paraSalvar, salvarPlanilha } from "./planilhasSalvas.js";

const sheet = { fileName: "teste.csv", columns: ["area", "horas"], rows: [{ area: "RH", horas: 2 }], numericColumns: ["horas"], persisted: true };

describe("planilhasSalvas", () => {
  it("converte a planilha da tela para o formato da cozinha e de volta", () => {
    const enviado = paraSalvar(sheet);
    expect(enviado).toEqual({ nome: "teste.csv", colunas: ["area", "horas"], colunas_numericas: ["horas"], linhas: [{ area: "RH", horas: 2 }] });

    const salva = { id: 7, nome: "teste.csv", colunas: enviado.colunas, colunas_numericas: ["horas"], linhas: enviado.linhas, n_linhas: 1 };
    expect(daCozinha(salva)).toEqual({ fileName: "teste.csv", columns: ["area", "horas"], rows: [{ area: "RH", horas: 2 }], numericColumns: ["horas"], savedId: 7 });
  });

  it("dá um nome padrão quando o arquivo não tem nome", () => {
    expect(paraSalvar({ ...sheet, fileName: "  " }).nome).toBe("planilha sem nome");
  });

  it("formata a data no padrão brasileiro e ignora datas inválidas", () => {
    expect(formatarData("2026-10-01T12:00:00Z")).toMatch(/^\d{2}\/10\/2026/);
    expect(formatarData("nada")).toBe("");
  });

  it("recusa antes de enviar uma planilha acima do limite", async () => {
    const grande = { ...sheet, rows: Array.from({ length: MAX_LINHAS_SALVAR + 1 }, () => ({ area: "RH" })) };
    await expect(salvarPlanilha(grande)).rejects.toThrow(/grande demais/);
  });
});
