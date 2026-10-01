// =============================================================================
// Rotas do servidor local. Separado do index.js para dar para testar sem abrir porta.
//
//   GET /health                 -> { ok: true }  (o servidor está de pé?)
//   GET /api/twygo/status       -> { configured: true|false }  (NUNCA devolve o token)
//   GET /api/twygo/users?all=true -> todos os usuários da Twygo (todas as páginas)
//   GET /api/twygo/users?page=2   -> só uma página (100 por página)
//
// Para criar uma rota nova: app.get("/api/minha-rota", (req, res) => res.json({...}))
// =============================================================================
import express from "express";
import { DEFAULT_BASE_URL, fetchAllUsers, fetchUsersPage, isTokenConfigured } from "./twygoApi.js";

export function createApp({ env = process.env, fetcher = fetch } = {}) {
  const app = express();
  const baseUrl = env.TWYGO_API_BASE_URL || DEFAULT_BASE_URL;

  app.get("/health", (_req, res) => {
    res.json({ ok: true, message: "Servidor local funcionando." });
  });

  app.get("/api/twygo/status", (_req, res) => {
    res.json({ configured: isTokenConfigured(env.TWYGO_API_TOKEN) });
  });

  app.get("/api/twygo/users", async (req, res) => {
    try {
      const token = env.TWYGO_API_TOKEN;
      const result =
        req.query.all === "true"
          ? await fetchAllUsers({ token, baseUrl, fetcher })
          : await fetchUsersPage({ page: Number(req.query.page) || 1, token, baseUrl, fetcher });
      res.status(result.status).json(result.body);
    } catch {
      res.status(502).json({ message: "Não foi possível falar com a Twygo agora. Confira sua internet e tente de novo.", code: "TWYGO_UNREACHABLE" });
    }
  });

  // Qualquer outra rota /api que não existe
  app.use("/api", (_req, res) => {
    res.status(404).json({ message: "Esta rota não existe no servidor local." });
  });

  return app;
}
