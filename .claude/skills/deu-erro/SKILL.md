---
name: deu-erro
description: Diagnostica e corrige erros do painel local (Docker, cozinha FastAPI, banco, tela). Use quando o usuário disser "deu erro", "não funciona", "quebrou", "tela branca", "página em branco", "não abre", "erro vermelho", "porta ocupada", ou colar uma mensagem de erro.
---

# Deu erro

Seja calmo e simples: "Vamos ver o que aconteceu." Explique a causa em uma frase antes de corrigir. Nunca mostre o `.env` (nem `docker compose config`).

## Passo a passo
1. **Leia o erro inteiro** (o que o usuário colou, a tela ou os logs). Identifique arquivo e linha.
2. **Docker está aberto?** `docker info >/dev/null 2>&1 && echo ok`. Erro "Cannot connect to the Docker daemon" / "is the docker daemon running?" → peça para abrir o **Docker Desktop** e esperar a baleia 🐳 parar de animar; depois `make up`.
3. **O que está ligado?** `docker compose ps`. Algum serviço parado, "restarting" ou "unhealthy"? Veja `docker compose logs --tail=80 <serviço>` (`postgres`, `backend`, `frontend`).
4. **Saúde**: `curl -s http://127.0.0.1:5194/health` → `{"ok":true,"db":true}`.
   - Sem resposta → cozinha caída: veja os logs do `backend` (erro de Python com arquivo e linha). Corrija o arquivo; ela recarrega sozinha.
   - `"db": false` → banco fora: `docker compose logs --tail=50 postgres`; `make up`.
5. **Porta ocupada** ("port is already allocated", "address already in use" na 5193 ou 5194): outro programa ou outra cópia do sistema está usando. Veja com `lsof -i :5193 -i :5194` (Mac) ou `netstat -ano | findstr 5193` (Windows) e `docker ps` (outro projeto do Docker?). Pare o que estiver usando (com o ok do usuário) e rode `make up`.
6. **Página em branco**: `docker compose logs --tail=80 frontend` e o console do navegador. Para achar o erro de código: `docker compose exec -T frontend npm run build`. Corrija o arquivo indicado.
7. **Mudou uma tabela** (`backend/app/models.py`) e aparece erro de coluna que não existe (`UndefinedColumn`, `no such column`, `column ... does not exist`) → skill `resetar-banco` (avise que apaga as planilhas salvas).
8. **Peça nova não encontrada** ("Cannot find module", "ModuleNotFoundError") → mudou `package.json`/`requirements.txt`? Rode `make up` (reconstrói; o `-V` renova o `node_modules` do container). **Nunca** rode `npm install`/`pip install` no computador da pessoa.
9. **Token / Twygo**:
   - `curl -s http://127.0.0.1:5194/api/twygo/status` → `configured:false` = falta `.env` ou o token ainda é o texto de exemplo. Confira **só se existe**: `test -f .env && echo existe`. Nunca rode `cat .env`.
   - Para resolver: crie o `.env` (`cp .env.example .env`) se faltar, abra para o usuário (`open -e .env` no Mac, `notepad .env` no Windows), peça que cole o token depois de `TWYGO_API_TOKEN=`, salve e diga "pronto". Depois `make up`. **Nunca peça o token no chat.**
   - 401 "token inválido ou vencido" → pedir token novo ao João ou à Adriana.
   - 502 "não foi possível falar com a Twygo" → internet/VPN.
10. **Confirme a correção**: `make test`, recarregue a página.

## Ao final
- Diga em uma frase o que causou o problema e o que foi feito.
- Diga qual endereço abrir para conferir.
- Se não conseguiu resolver, resuma o erro para o usuário levar ao João, à Adriana ou a um dev (sem incluir token nem dados pessoais).
