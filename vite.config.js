import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Configuração da TELA (frontend).
// - Só o próprio computador acessa (127.0.0.1): nada fica exposto para a rede/Wi-Fi.
// - Tudo que começa com /api ou /health é repassado para o servidor local (porta 5194),
//   que é quem guarda o token da Twygo.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5193,
    strictPort: true,
    proxy: {
      "/api": "http://127.0.0.1:5194",
      "/health": "http://127.0.0.1:5194"
    }
  },
  build: {
    // Evita um aviso de "arquivo grande" que não é problema para uso local.
    chunkSizeWarningLimit: 1500
  },
  preview: {
    host: "127.0.0.1",
    port: 5193
  },
  test: {
    // Testes rodam no Node, sem navegador. Arquivos *.test.js ao lado do código.
    environment: "node",
    include: ["src/**/*.test.js", "server/**/*.test.js"]
  }
});
