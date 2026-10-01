---
name: explicar-o-que-mudou
description: Resume em linguagem simples o que foi alterado no projeto. Use quando o usuário perguntar "o que mudou?", "o que você fez?", "explica o que foi feito", "resumo das mudanças", ou ao final de uma sessão.
---

# Explicar o que mudou

1. Descubra as mudanças: `git status --short` e `git diff --stat` **apenas nesta pasta** (`git diff -- .`). Se não houver git, use o histórico da conversa.
2. Ignore `node_modules`, `dist`, `package-lock.json`. **Nunca** abra ou cite o conteúdo do `.env`.
3. Responda neste formato, sem jargão:

   **O que você ganhou:** 1 a 3 frases sobre o resultado na tela.

   **O que mudou, arquivo por arquivo:**
   - `src/pages/Despesas.jsx` — página nova que mostra as despesas por categoria.
   - `src/pages/index.js` — colocamos a página nova no menu.

   **Como conferir:** abra http://localhost:5193/... e veja ...

   **Testes:** ok / o que falhou.
4. Troque termos técnicos: "componente" → "peça da tela"; "rota" → "endereço"; "backend" → "servidor local"; "deploy" → "publicar".
