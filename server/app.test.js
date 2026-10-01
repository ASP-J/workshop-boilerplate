import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "./app.js";

// Sobe o app numa porta aleatória só durante o teste.
let server;
async function start(env, fetcher) {
  server = createApp({ env, fetcher }).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  return `http://127.0.0.1:${server.address().port}`;
}
afterEach(() => server?.close());

describe("servidor local", () => {
  it("/health responde ok", async () => {
    const url = await start({});
    const body = await (await fetch(`${url}/health`)).json();
    expect(body.ok).toBe(true);
  });

  it("/api/twygo/status diz configured=false sem token e nunca devolve o token", async () => {
    let url = await start({});
    expect(await (await fetch(`${url}/api/twygo/status`)).json()).toEqual({ configured: false });
    server.close();

    url = await start({ TWYGO_API_TOKEN: "super-secreto" });
    const text = await (await fetch(`${url}/api/twygo/status`)).text();
    expect(JSON.parse(text)).toEqual({ configured: true });
    expect(text).not.toContain("super-secreto");
  });

  it("/api/twygo/users devolve 503 sem token", async () => {
    const url = await start({});
    const response = await fetch(`${url}/api/twygo/users?all=true`);
    expect(response.status).toBe(503);
  });

  it("/api/twygo/users?all=true usa o fetch mockado", async () => {
    const fetcher = vi.fn(async () => ({
      status: 200,
      json: async () => ({ data: { users: [{ id: 1, name: "Ana", email: "a@exemplo.com", phone: "123", address: "Rua" }], pagination: { total_pages: 1, total_entries: 1 } } })
    }));
    const url = await start({ TWYGO_API_TOKEN: "t", TWYGO_API_BASE_URL: "https://api.teste" }, fetcher);
    const body = await (await fetch(`${url}/api/twygo/users?all=true`)).json();
    expect(body.data.users).toEqual([{ user_id: 1, name: "Ana", email: "a@exemplo.com", department: "" }]);
    expect(body.data.pagination.total_entries).toBe(1);
    expect(fetcher.mock.calls[0][0]).toContain("https://api.teste/api/v2/users");
  });
});
