---
name: nova-pagina
description: Cria uma página nova no menu do painel. Use quando o usuário pedir "crie uma página", "nova tela", "quero uma aba para...", "adicione no menu".
---

# Nova página

1. **Plano em linguagem simples** (2 a 4 tópicos) antes de mexer.
2. Copie `src/pages/MinhaAutomacao.jsx` para `src/pages/<NomeEmPascalCase>.jsx`. Ajuste título, comentário do topo e conteúdo.
   - Reaproveite `KpiCard`, `ChartCard`, `DataTable`, `SheetLoader`, `EmptyState`, `LoadingState`, `ErrorState` (`src/components/`). **Confira os nomes das props na tabela "Peças prontas" do `CLAUDE.md`** (ex.: `ErrorState` usa `mensagem`).
   - Planilha carregada pelo usuário: `const sheet = useSheet()` (`src/lib/sheetStore.js`). Se `null`, mostre `<SheetLoader />`.
   - Contas em `src/lib/aggregate.js` (`groupBy`, `sum`, `average`, `formatNumber`).
3. Em `src/pages/index.js`, adicione o import e **uma linha** na lista `pages`:
   `{ path: "/nome-da-pagina", label: "Nome da página", icon: "📌", component: NomeDaPagina }`
   Não mexa no `App.jsx`.
4. Se criou cálculo novo, coloque em `src/lib/<nome>.js` com teste `src/lib/<nome>.test.js`.
5. Rode `npm test` e `npm run build`; corrija o que falhar.
6. Liste os arquivos alterados e termine com: "Abra **http://localhost:5193/nome-da-pagina** e confira [o que ver]".
