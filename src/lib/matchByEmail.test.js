import { describe, expect, it } from "vitest";
import { guessEmailColumn, matchByEmail } from "./matchByEmail.js";

describe("matchByEmail", () => {
  it("cruza ignorando maiúsculas e espaços", () => {
    const rows = [{ email: "  Ana@Exemplo.com " }, { email: "ninguem@exemplo.com" }, { email: "" }];
    const users = [{ email: "ana@exemplo.com", nome: "Ana" }, { email: "outra@exemplo.com" }];
    const result = matchByEmail(rows, "email", users);
    expect(result.total).toBe(3);
    expect(result.matched).toHaveLength(1);
    expect(result.matched[0].user.nome).toBe("Ana");
    expect(result.unmatched).toHaveLength(2);
    expect(result.emails).toEqual({ total: 2, matched: 1 });
  });

  it("conta pessoas (e-mails diferentes) separado de linhas", () => {
    const rows = [{ email: "ana@exemplo.com" }, { email: "ANA@exemplo.com" }, { email: "bia@exemplo.com" }];
    const result = matchByEmail(rows, "email", [{ email: "ana@exemplo.com" }]);
    expect(result.matched).toHaveLength(2);
    expect(result.emails).toEqual({ total: 2, matched: 1 });
  });

  it("adivinha a coluna de e-mail", () => {
    expect(guessEmailColumn(["nome", "contato_email"])).toBe("contato_email");
    expect(guessEmailColumn(["nome", "x"], [{ nome: "A", x: "a@b.com" }])).toBe("x");
  });
});
