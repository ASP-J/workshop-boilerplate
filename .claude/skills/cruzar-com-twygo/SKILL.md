---
name: cruzar-com-twygo
description: Cruza uma planilha (carregada ou salva no banco) com os usuários da Twygo (por e-mail) ou busca dados da API Twygo. Use quando o usuário falar em "cruzar com a Twygo", "quem está na plataforma", "usuários da Twygo", "comparar com a Twygo", "token".
---

# Cruzar com a Twygo

## Segurança
- O token fica **só** no `.env`, lido pela cozinha (`backend/app/routers/twygo.py`, via `docker-compose.yml`). Nunca mostre, imprima ou coloque em código. Não rode `docker compose config` nem `printenv` no container.
- O navegador fala apenas com o servidor local (`/api/...`), nunca direto com `api.twygo.com`.
- Somente leitura (`GET`).

## Peças prontas
- Endpoint: `GET /api/twygo/users?all=true` → `{ data: { users, pagination: { total_entries, total_pages } } }` (todas as páginas, 100 por vez). Cada usuário vem **só** com `user_id`, `name`, `email`, `department` (`pick_user_fields` corta telefone, endereço, CEP e documentos).
- Status: `GET /api/twygo/status` → `{ configured: true|false }`.
- Tela: `const { dados, erro, carregando, recarregar } = useApi("/api/twygo/users?all=true")`, depois `presentUsers(dados).users` → `{ id, nome, email, departamento }`.
- Cruzar: `matchByEmail(rows, colunaEmail, users)` → `{ matched: [{ row, user }], unmatched, total, emails: { total, matched } }` (`total` = linhas, `emails` = pessoas). `guessEmailColumn(columns, rows)` acha a coluna de e-mail.
- Planilha salva no banco: `<EscolherPlanilhaSalva sheet={sheet} />` (já está na página Cruzar) ou `setSheet(await abrirPlanilha(id))`.
- Conferência com a planilha do workshop: 186 usuários na Twygo; **150 de 160** e-mails encontrados (271 de 287 linhas). Os 10 não encontrados são `@anonimizado.com` de propósito.
- A planilha do workshop tem **e-mails reais**: fale só em quantidades, nunca liste e-mails/nomes na resposta.
- Erros: reaproveite `ErroTwygo` de `frontend/src/pages/UsuariosTwygo.jsx` (trata token faltando e token vencido).
- Exemplo completo: `frontend/src/pages/CruzarPlanilhaTwygo.jsx`.

## Token não configurado (fluxo único)
1. Se ainda não existir (`test -f .env`, sem abrir): `cp .env.example .env` (Windows: `copy .env.example .env`).
2. Abra o arquivo para o usuário: **Mac** `open -e .env` · **Windows** `notepad .env`.
3. Diga: "Cole o token logo depois de `TWYGO_API_TOKEN=`, salve e me diga **pronto**." **Nunca peça o token no chat.**
4. Quando ele disser "pronto": `make up` (recria a cozinha com o `.env` novo) e confira `curl -s http://127.0.0.1:5194/api/twygo/status` → `{"configured":true}`.
5. Se ele colar o token no chat mesmo assim: grave no `.env`, **não repita o valor** e recomende trocar/revogar o token depois do workshop.

## Novo endpoint da Twygo
Só `GET`. Crie a função em `backend/app/routers/twygo.py` reaproveitando `_config()` e `_buscar_pagina` como modelo, devolvendo **só os campos que a tela usa**. Teste em `backend/tests/test_twygo.py` com a Twygo falsa (`usar_twygo_falsa` + `httpx.MockTransport`) — nunca chame a Twygo de verdade nos testes. `make test`.
