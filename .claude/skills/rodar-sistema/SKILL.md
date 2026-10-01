---
name: rodar-sistema
description: Liga, abre, reinicia e desliga o painel local do workshop (Docker Compose). Use quando o usuário disser "suba o sistema", "rode o sistema", "liga o painel", "abre o sistema", "instala", "reinicie", "desligue", "pare o sistema", "não está abrindo", ou no primeiro pedido.
---

# Rodar o sistema

Fale sempre em português simples. Nunca mostre o conteúdo do `.env` (nem rode `docker compose config`, que mostra o token).
Analogia: o Docker é o prédio do restaurante; `make up` acende as luzes do **estoque** (banco), da **cozinha** (servidor) e do **salão** (tela).

**Antes de tudo, veja se é Mac ou Windows** (plataforma `darwin` × `win32` no seu contexto). No Windows **não** use `make`, `cp`, `open -e` nem `/dev/null` no `cmd`: use `docker compose ...` e os `.bat` (o usuário pode clicar duas vezes em `iniciar.bat`, que faz os passos 1, 4, 5 e abre o navegador).

## Ligar

1. **Docker aberto?** Rode `docker info >/dev/null 2>&1 && echo ok` (Windows/cmd: `docker info >nul 2>&1 && echo ok`). Se falhar: "Abra o **Docker Desktop** (ícone da baleia 🐳), espere ele terminar de iniciar e me avise." Pare aqui até ele avisar.
   - Windows e o Docker Desktop nem abre (erro de **WSL 2** ou **virtualização**)? Veja "Problemas comuns no Windows" no `README.md`.
2. **Primeiro pedido / pasta sem o projeto?** Se não existir `docker-compose.yml` na pasta, clone: `git clone https://github.com/ASP-J/workshop-boilerplate.git` e trabalhe dentro de `workshop-boilerplate/`.
3. **Já está ligado?** `docker compose ps`. Se os 3 serviços (`postgres`, `backend`, `frontend`) estão "running", só confira (passo 5).
4. Ligue: **Mac** `make up` · **Windows** `docker compose up -d --build -V` (ou peça ao usuário para clicar duas vezes em `iniciar.bat`). Sem `.env` também liga (a Twygo só fica "não configurada").
   - Primeira vez demora alguns minutos (baixa as peças). Diga: "estou montando o sistema pela primeira vez, leva uns minutos".
5. Confirme (pode levar ~20 s depois do `up`):
   - (No Windows/cmd escreva `curl.exe` e troque `/dev/null` por `nul`.)
   - `curl -s http://127.0.0.1:5194/health` → `{"ok":true,"db":true}`
   - `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5193/` → `200`
   - `curl -s http://127.0.0.1:5194/api/twygo/status` → token configurado ou não.
   - Se algo falhar: `docker compose logs --tail=80 backend frontend` e use a skill `deu-erro`.
6. Responda: "Pronto! Abra **http://localhost:5193** no navegador." e diga se o token está ou não configurado (sem mostrar o token).
7. Token não configurado e o usuário quer usar a Twygo? Ofereça: crio o `.env` (`cp .env.example .env`, Windows `copy .env.example .env`) e abro o arquivo (`open -e .env` no Mac, `notepad .env` no Windows) para você colar o token depois de `TWYGO_API_TOKEN=`; salve e me diga "pronto" que eu religo com `make up` (Windows: `docker compose up -d --build -V`). **Nunca peça o token no chat.**

## Desligar

**Mac** `make down` · **Windows** `docker compose down` (ou clique duplo em `parar.bat`). As planilhas salvas no banco **continuam guardadas**.

## Reiniciar / aplicar mudanças

- Código em `frontend/src` ou `backend/app`: recarrega sozinho ao salvar (não precisa fazer nada).
- Mudou `.env`, `package.json`, `requirements.txt`, `Dockerfile` ou `docker-compose.yml`: `make up` de novo (Windows: `docker compose up -d --build -V` ou `iniciar.bat`) — reconstrói.
- Só reiniciar a cozinha: `docker compose restart backend`.

## Nunca

- Não instale Node, Python, banco ou pacotes no computador da pessoa (nada de `npm install`/`pip install` fora do Docker).
- Porta 5193/5194 ocupada por outro programa? Dá para trocar no `.env` (`FRONTEND_PORT` / `BACKEND_PORT`, veja o `.env.example`) — avise que o endereço muda.
- Não tire o `127.0.0.1:` das portas do `docker-compose.yml` nem publique a porta do banco.
- Não publique em lugar nenhum (Vercel, Dokploy, nuvem, GitHub, `docker push`).
