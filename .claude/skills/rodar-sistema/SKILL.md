---
name: rodar-sistema
description: Liga, abre, reinicia e desliga o painel local do workshop (Docker Compose). Use quando o usuário disser "suba o sistema", "rode o sistema", "liga o painel", "abre o sistema", "instala", "reinicie", "desligue", "pare o sistema", "não está abrindo", ou no primeiro pedido.
---

# Rodar o sistema

Fale sempre em português simples. Nunca mostre o conteúdo do `.env` (nem rode `docker compose config`, que mostra o token).
Analogia: o Docker é o prédio do restaurante; `make up` acende as luzes do **estoque** (banco), da **cozinha** (servidor) e do **salão** (tela).

## Ligar

1. **Docker aberto?** Rode `docker info >/dev/null 2>&1 && echo ok`. Se falhar: "Abra o **Docker Desktop** (ícone da baleia 🐳), espere ele terminar de iniciar e me avise." Pare aqui até ele avisar.
2. **Primeiro pedido / pasta sem o projeto?** Se não existir `docker-compose.yml` na pasta, clone: `git clone https://github.com/ASP-J/workshop-boilerplate.git` e trabalhe dentro de `workshop-boilerplate/`.
3. **Já está ligado?** `docker compose ps`. Se os 3 serviços (`postgres`, `backend`, `frontend`) estão "running", só confira (passo 5).
4. Ligue: `make up` (sem `make`, ex. Windows: `docker compose up -d --build -V`).
   - Primeira vez demora alguns minutos (baixa as peças). Diga: "estou montando o sistema pela primeira vez, leva uns minutos".
5. Confirme (pode levar ~20 s depois do `up`):
   - `curl -s http://127.0.0.1:5194/health` → `{"ok":true,"db":true}`
   - `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5193/` → `200`
   - `curl -s http://127.0.0.1:5194/api/twygo/status` → token configurado ou não.
   - Se algo falhar: `docker compose logs --tail=80 backend frontend` e use a skill `deu-erro`.
6. Responda: "Pronto! Abra **http://localhost:5193** no navegador." e diga se o token está ou não configurado (sem mostrar o token).
7. Token não configurado e o usuário quer usar a Twygo? Ofereça: crio o `.env` (`cp .env.example .env`, Windows `copy .env.example .env`) e abro o arquivo (`open -e .env` no Mac, `notepad .env` no Windows) para você colar o token depois de `TWYGO_API_TOKEN=`; salve e me diga "pronto" que eu religo com `make up`. **Nunca peça o token no chat.**

## Desligar

`make down` (ou `docker compose down`). As planilhas salvas no banco **continuam guardadas**.

## Reiniciar / aplicar mudanças

- Código em `frontend/src` ou `backend/app`: recarrega sozinho ao salvar (não precisa fazer nada).
- Mudou `.env`, `package.json`, `requirements.txt`, `Dockerfile` ou `docker-compose.yml`: `make up` de novo (reconstrói).
- Só reiniciar a cozinha: `docker compose restart backend`.

## Nunca

- Não instale Node, Python, banco ou pacotes no computador da pessoa (nada de `npm install`/`pip install` fora do Docker).
- Não tire o `127.0.0.1:` das portas do `docker-compose.yml` nem publique a porta do banco.
- Não publique em lugar nenhum (Vercel, Dokploy, nuvem, GitHub, `docker push`).
