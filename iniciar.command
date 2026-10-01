#!/bin/bash
# Mac: clique duas vezes neste arquivo para ligar o sistema (o mesmo que "make up").
# Não precisa de "make" instalado.
cd "$(dirname "$0")" || exit 1

if ! command -v docker >/dev/null 2>&1; then
  echo "O Docker não está instalado. Instale o Docker Desktop: https://www.docker.com/products/docker-desktop/"
  read -r -p "Aperte Enter para fechar." _; exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "Abra o Docker Desktop e espere a baleia parar de se mexer. Depois clique de novo em iniciar.command."
  read -r -p "Aperte Enter para fechar." _; exit 1
fi
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Criei o .env a partir do .env.example (para o token: open -e .env)."
fi

FRONTEND_PORT="${FRONTEND_PORT:-$(sed -n 's/^FRONTEND_PORT=//p' .env | tr -d '\r' | tail -n1)}"
BACKEND_PORT="${BACKEND_PORT:-$(sed -n 's/^BACKEND_PORT=//p' .env | tr -d '\r' | tail -n1)}"
FRONTEND_PORT="${FRONTEND_PORT:-5193}"
BACKEND_PORT="${BACKEND_PORT:-5194}"

echo "Ligando o sistema (na primeira vez demora alguns minutos)..."
if ! docker compose up -d --build -V; then
  echo "O Docker não conseguiu ligar o sistema. Copie a mensagem acima e cole no Claude Code: deu erro: ..."
  read -r -p "Aperte Enter para fechar." _; exit 1
fi

echo "Esperando o sistema responder..."
for _ in $(seq 1 90); do
  curl -sf -o /dev/null "http://127.0.0.1:${BACKEND_PORT}/health" \
    && curl -sf -o /dev/null "http://127.0.0.1:${FRONTEND_PORT}/" && break
  sleep 2
done

echo ""
echo "Pronto! Abra http://localhost:${FRONTEND_PORT} no navegador."
open "http://localhost:${FRONTEND_PORT}"
