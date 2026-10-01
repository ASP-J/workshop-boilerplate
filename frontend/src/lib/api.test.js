import { describe, expect, it, vi } from "vitest";
import { ApiError, apiDelete, apiGet, apiPost } from "./api.js";

const resposta = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

describe("api", () => {
  it("apiGet devolve o JSON quando dá certo", async () => {
    const fetcher = vi.fn(async () => resposta(200, { ok: true, db: true }));
    expect(await apiGet("/health", fetcher)).toEqual({ ok: true, db: true });
    expect(fetcher.mock.calls[0][1].method).toBe("GET");
  });

  it("apiPost manda JSON e apiDelete usa DELETE", async () => {
    const fetcher = vi.fn(async () => resposta(201, { id: 1 }));
    await apiPost("/api/planilhas", { nome: "x" }, fetcher);
    const [, opcoes] = fetcher.mock.calls[0];
    expect(opcoes.method).toBe("POST");
    expect(opcoes.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(opcoes.body)).toEqual({ nome: "x" });

    await apiDelete("/api/planilhas/1", fetcher);
    expect(fetcher.mock.calls[1][1].method).toBe("DELETE");
  });

  it("usa a mensagem e o código da cozinha ({ message, code })", async () => {
    const fetcher = vi.fn(async () => resposta(503, { message: "Falta o token", code: "TOKEN_MISSING" }));
    await expect(apiGet("/api/twygo/users", fetcher)).rejects.toMatchObject({ message: "Falta o token", code: "TOKEN_MISSING", status: 503 });
  });

  it("entende o { detail } padrão do FastAPI e cai numa mensagem amigável sem corpo", async () => {
    await expect(apiGet("/x", vi.fn(async () => resposta(400, { detail: "Pedido ruim" })))).rejects.toThrow("Pedido ruim");
    const semCorpo = { ok: false, status: 502, json: async () => { throw new Error("não é json"); } };
    await expect(apiGet("/x", vi.fn(async () => semCorpo))).rejects.toThrow(/não está respondendo/);
  });

  it("servidor desligado vira erro OFFLINE em português", async () => {
    const erro = await apiGet("/health", vi.fn(async () => { throw new TypeError("fetch failed"); })).catch((e) => e);
    expect(erro).toBeInstanceOf(ApiError);
    expect(erro.code).toBe("OFFLINE");
    expect(erro.message).toMatch(/rode o sistema/);
  });
});
