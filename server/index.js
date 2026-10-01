// =============================================================================
// Liga o servidor local (backend) na porta 5194.
// Ele escuta SÓ em 127.0.0.1: nenhum outro computador da rede consegue acessar.
// =============================================================================
import "dotenv/config";
import { createApp } from "./app.js";

const HOST = "127.0.0.1"; // não troque: é isso que mantém tudo só no seu computador
const port = Number(process.env.PORT || 5194);

const server = createApp().listen(port, HOST, () => {
  console.log(`Servidor local em http://${HOST}:${port} (só este computador)`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`A porta ${port} já está em uso. Feche o outro terminal que está rodando o sistema (Ctrl+C) e tente de novo.`);
    process.exit(1);
  }
  throw error;
});
