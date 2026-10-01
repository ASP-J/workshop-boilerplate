import { describe, expect, it } from "vitest";
import { average, countBy, groupBy, sum } from "./aggregate.js";

const rows = [
  { setor: "RH", horas: 4 },
  { setor: "RH", horas: 6 },
  { setor: "Vendas", horas: 2 },
  { setor: "", horas: null }
];

describe("aggregate", () => {
  it("soma e média ignoram vazios", () => {
    expect(sum(rows, "horas")).toBe(12);
    expect(average(rows, "horas")).toBe(4);
  });

  it("groupBy conta linhas e ordena do maior para o menor", () => {
    expect(countBy(rows, "setor")).toEqual([
      { name: "RH", value: 2 },
      { name: "(vazio)", value: 1 },
      { name: "Vendas", value: 1 }
    ]);
  });

  it("groupBy soma uma coluna numérica e respeita limite", () => {
    expect(groupBy(rows, "setor", "horas", { limit: 1 })).toEqual([{ name: "RH", value: 10 }]);
  });
});
