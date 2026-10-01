import { describe, expect, it } from "vitest";
import { fromMatrix, normalizeHeader, parseCsvText, toNumber } from "./parseSheet.js";

describe("normalizeHeader", () => {
  it("tira acento, espaço e maiúscula", () => {
    expect(normalizeHeader(" Centro de Custo ")).toBe("centro_de_custo");
    expect(normalizeHeader("E-mail")).toBe("e_mail");
    expect(normalizeHeader("Situação")).toBe("situacao");
    expect(normalizeHeader("", 2)).toBe("coluna_3");
  });
});

describe("toNumber", () => {
  it("entende formato brasileiro e moeda", () => {
    expect(toNumber("1.234,56")).toBe(1234.56);
    expect(toNumber("R$ 10,5")).toBe(10.5);
    expect(toNumber("12.5")).toBe(12.5);
    expect(toNumber("1.500")).toBe(1500);
    expect(toNumber("abc")).toBeNull();
    expect(toNumber("")).toBeNull();
  });
});

describe("parseCsvText", () => {
  it("lê CSV com vírgula, normaliza cabeçalho e detecta colunas numéricas", () => {
    const csv = "Nome,E-mail,Horas\nAna,ana@exemplo.com,8\nBruno,bruno@exemplo.com,\"4,5\"\n";
    const sheet = parseCsvText(csv);
    expect(sheet.columns).toEqual(["nome", "e_mail", "horas"]);
    expect(sheet.rows).toHaveLength(2);
    expect(sheet.numericColumns).toEqual(["horas"]);
    expect(sheet.rows[1].horas).toBe(4.5);
  });

  it("lê CSV com ponto e vírgula (Excel BR) e ignora BOM e linhas vazias", () => {
    const sheet = parseCsvText("﻿categoria;valor\nViagem;1.200,00\n\nSoftware;300\n");
    expect(sheet.columns).toEqual(["categoria", "valor"]);
    expect(sheet.rows.map((r) => r.valor)).toEqual([1200, 300]);
  });

  it("renomeia colunas repetidas", () => {
    expect(fromMatrix([["a", "a"], ["1", "2"]]).columns).toEqual(["a", "a_2"]);
  });
});
