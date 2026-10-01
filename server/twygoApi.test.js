import { describe, expect, it, vi } from "vitest";
import { fetchAllUsers, fetchUsersPage, isTokenConfigured, pickUserFields } from "./twygoApi.js";

function pageResponse(users, pagination, status = 200) {
  return { status, json: async () => ({ message: "success", data: { users, pagination } }) };
}

describe("isTokenConfigured", () => {
  it("rejeita vazio e o texto de exemplo", () => {
    expect(isTokenConfigured("")).toBe(false);
    expect(isTokenConfigured(undefined)).toBe(false);
    expect(isTokenConfigured("cole_o_token_do_workshop_aqui")).toBe(false);
    expect(isTokenConfigured("abc123")).toBe(true);
  });
});

describe("fetchUsersPage", () => {
  it("chama a Twygo com Bearer token e paginação", async () => {
    const fetcher = vi.fn(async () => pageResponse([], {}));
    await fetchUsersPage({ page: 2, token: "segredo", baseUrl: "https://api.teste", fetcher });
    expect(fetcher).toHaveBeenCalledWith("https://api.teste/api/v2/users?page=2&per_page=100", {
      headers: { Accept: "application/json", Authorization: "Bearer segredo" }
    });
  });

  it("devolve 503 amigável e não chama a API sem token", async () => {
    const fetcher = vi.fn();
    const result = await fetchUsersPage({ token: "", fetcher });
    expect(result.status).toBe(503);
    expect(result.body.code).toBe("TOKEN_MISSING");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("traduz 401 para token inválido/vencido", async () => {
    const fetcher = vi.fn(async () => ({ status: 401, json: async () => ({}) }));
    const result = await fetchUsersPage({ token: "x", fetcher });
    expect(result.status).toBe(401);
    expect(result.body.code).toBe("TOKEN_INVALID");
  });
});

describe("fetchAllUsers", () => {
  it("junta todas as páginas usando total_pages", async () => {
    const fetcher = vi.fn(async (url) => {
      const page = Number(new URL(url).searchParams.get("page"));
      const users = page === 1 ? [{ id: 1 }, { id: 2 }] : [{ id: 3 }];
      return pageResponse(users, { total_pages: 2, total_entries: 3 });
    });
    const result = await fetchAllUsers({ token: "x", baseUrl: "https://api.teste", fetcher });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result.body.data.users.map((u) => u.user_id)).toEqual([1, 2, 3]);
    expect(result.body.data.pagination.total_entries).toBe(3);
  });

  it("para quando a página vem incompleta e não há total_pages", async () => {
    const full = Array.from({ length: 100 }, (_, i) => ({ id: i }));
    const fetcher = vi.fn(async (url) => {
      const page = Number(new URL(url).searchParams.get("page"));
      return pageResponse(page === 1 ? full : [{ id: 999 }], {});
    });
    const result = await fetchAllUsers({ token: "x", fetcher });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result.body.data.users).toHaveLength(101);
  });

  it("devolve o erro se uma página falhar", async () => {
    const fetcher = vi.fn(async () => ({ status: 500, json: async () => ({ message: "erro" }) }));
    const result = await fetchAllUsers({ token: "x", fetcher });
    expect(result.status).toBe(500);
  });
});

describe("privacidade dos usuários", () => {
  const completo = {
    user_id: 7,
    name: "Ana Teste",
    email: "ana@exemplo.com",
    department: "RH",
    phone: "41999999999",
    address: "Rua X, 1",
    zip_code: "80000-000",
    cpf: "000.000.000-00",
    documents: [{ tipo: "RG" }]
  };

  it("pickUserFields fica só com user_id, name, email e department", () => {
    expect(pickUserFields(completo)).toEqual({ user_id: 7, name: "Ana Teste", email: "ana@exemplo.com", department: "RH" });
    expect(pickUserFields({ id: 3, first_name: "Bia", last_name: "Lima", sector: "TI" })).toEqual({ user_id: 3, name: "Bia Lima", email: "", department: "TI" });
  });

  it("fetchUsersPage e fetchAllUsers não devolvem telefone, endereço, CEP nem documentos", async () => {
    const fetcher = vi.fn(async () => pageResponse([completo], { total_pages: 1, total_entries: 1, current_page: 1 }));
    const page = await fetchUsersPage({ token: "x", fetcher });
    expect(Object.keys(page.body.data.users[0]).sort()).toEqual(["department", "email", "name", "user_id"]);
    expect(page.body.data.pagination).toEqual({ total_pages: 1, total_entries: 1, current_page: 1 });

    const all = await fetchAllUsers({ token: "x", fetcher });
    const text = JSON.stringify(all.body);
    for (const segredo of ["41999999999", "Rua X", "80000-000", "000.000.000-00", "RG"]) expect(text).not.toContain(segredo);
    expect(all.body.data.pagination).toEqual({ total_entries: 1, total_pages: 1 });
  });
});
