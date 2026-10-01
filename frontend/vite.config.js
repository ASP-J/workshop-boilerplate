import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Configuração da TELA (frontend). Ela roda DENTRO do Docker.
// - Dentro do container a tela escuta em 0.0.0.0:5173 (obrigatório no Docker), mas o
//   docker-compose.yml só publica a porta em 127.0.0.1:5193: nada fica exposto para a rede/Wi-Fi.
// - Tudo que começa com /api ou /health é repassado para a cozinha (backend FastAPI),
//   que é quem guarda o token da Twygo e fala com o banco.
const apiTarget = process.env.VITE_API_TARGET || "http://backend:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    // Polling: faz o "salvou, atualizou" funcionar também no Windows/Docker Desktop.
    watch: { usePolling: process.env.VITE_USE_POLLING !== "false", interval: 400 },
    proxy: {
      "/api": apiTarget,
      "/health": apiTarget
    }
  },
  build: {
    // Evita um aviso de "arquivo grande" que não é problema para uso local.
    chunkSizeWarningLimit: 1500
  },
  test: {
    // Testes rodam no Node, sem navegador. Arquivos *.test.js ao lado do código.
    environment: "node",
    include: ["src/**/*.test.js"]
  }
});
