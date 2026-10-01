---
name: explicar-o-que-mudou
description: Resume em linguagem simples o que foi alterado no projeto. Use quando o usuário perguntar "o que mudou?", "o que você fez?", "explica o que foi feito", "resumo das mudanças", ou ao final de uma sessão.
---

# Explicar o que mudou

> **Windows?** Não existe `make`, `cp` nem `open -e`: use os comandos `docker compose ...` (ou os `.bat` da pasta) e `copy` / `notepad`. Tabela completa no `CLAUDE.md` (seção "Mac ou Windows?").

1. Descubra as mudanças: `git status --short` e `git diff --stat -- .` **apenas nesta pasta**. Se não houver git, use o histórico da conversa.
2. Ignore `node_modules`, `dist`, `__pycache__`, `package-lock.json`. **Nunca** abra ou cite o conteúdo do `.env`. Não cite dados de planilhas (e-mails, nomes).
3. Responda neste formato, sem jargão:

   **O que você ganhou:** 1 a 3 frases sobre o resultado na tela.

   **O que mudou, arquivo por arquivo:**
   - `frontend/src/pages/Despesas.jsx` — página nova (salão) que mostra as despesas por categoria.
   - `frontend/src/pages/index.js` — colocamos a página nova no menu.
   - `backend/app/routers/despesas.py` — endereço novo na cozinha que entrega os números.
   - `backend/app/models.py` — gaveta nova no estoque (tabela "despesas").

   **Como conferir:** abra http://localhost:5193/... e veja ...

   **Precisa fazer algo?** (só se for o caso) Ex.: "rode `make up`" (mudou peças) ou "rode `make reset`" (mudou tabela — apaga as planilhas salvas).

   **Testes:** ok / o que falhou.
4. Troque termos técnicos: "componente" → "peça da tela"; "rota/endpoint" → "endereço da cozinha"; "backend" → "cozinha (servidor local)"; "frontend" → "salão (tela)"; "banco/tabela" → "estoque/gaveta do estoque"; "container" → "caixinha do Docker"; "deploy" → "publicar".
