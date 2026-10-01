import { describe, expect, it } from "vitest";
import { escapeCell, toCsv } from "./exportCsv.js";

describe("exportCsv", () => {
  it("gera CSV com ; e respeita a ordem das colunas", () => {
    const csv = toCsv([{ b: 2, a: "x" }], ["a", "b"]);
    expect(csv).toBe("a;b\r\nx;2");
  });

  it("protege textos com separador, aspas e quebra de linha", () => {
    expect(escapeCell("a;b")).toBe('"a;b"');
    expect(escapeCell('diz "oi"')).toBe('"diz ""oi"""');
    expect(escapeCell(null)).toBe("");
  });

  it("usa as chaves da primeira linha quando não recebe colunas", () => {
    expect(toCsv([{ nome: "Ana" }])).toBe("nome\r\nAna");
  });
});
