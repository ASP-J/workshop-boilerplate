---
name: nova-pagina
description: Cria uma página nova no menu do painel e, se precisar guardar dados, um endpoint FastAPI e uma tabela no banco. Use quando o usuário pedir "crie uma página", "nova tela", "quero uma aba para...", "adicione no menu", "quero cadastrar/registrar/guardar X".
---

# Nova página

1. **Plano em linguagem simples** (2 a 4 tópicos) antes de mexer. Diga se vai precisar guardar algo no banco (estoque) ou se é só tela (salão).

## A página (sempre)

2. Copie `frontend/src/pages/MinhaAutomacao.jsx` para `frontend/src/pages/<NomeEmPascalCase>.jsx`. Ajuste título, comentário do topo e conteúdo.
   - Reaproveite `KpiCard`, `ChartCard`, `DataTable`, `SheetLoader`, `PlanilhasSalvas`, `EmptyState`, `LoadingState`, `ErrorState` (`frontend/src/components/`). **Confira os nomes das props na tabela "Peças prontas" do `CLAUDE.md`** (ex.: `ErrorState` usa `mensagem`).
   - Planilha carregada: `const sheet = useSheet()` (`frontend/src/lib/sheetStore.js`). Se `null`, mostre `<SheetLoader />`.
   - Contas em `frontend/src/lib/aggregate.js` (`groupBy`, `sum`, `average`, `formatNumber`).
3. Em `frontend/src/pages/index.js`, adicione o import e **uma linha** na lista `pages`:
   `{ path: "/nome-da-pagina", label: "Nome da página", icon: "📌", component: NomeDaPagina }`
   Não mexa no `App.jsx`.
4. Cálculo novo na tela → `frontend/src/lib/<nome>.js` com teste `frontend/src/lib/<nome>.test.js`.

## Endpoint + tabela (só se precisar guardar ou calcular na cozinha)

5. **Tabela**: classe nova em `backend/app/models.py` (copie `Planilha`). Tabela nova é criada sozinha quando a cozinha reinicia. **Mudou** uma tabela existente → skill `resetar-banco` (avise que apaga as planilhas salvas).
6. **Formato**: `XEntrada` / `XSaida` em `backend/app/schemas.py` (`model_config = ConfigDict(from_attributes=True)` na saída).
7. **Router**: `backend/app/routers/<assunto>.py` copiando `planilhas.py` (`APIRouter(prefix="/api/<assunto>")`, `Depends(get_db)`, erros com `ErroAmigavel(status, "mensagem em português", "CODIGO")`). Registre em `backend/app/main.py` com `app.include_router(<assunto>.router)`.
8. **Teste**: `backend/tests/test_<assunto>.py` com a fixture `client` (veja `test_planilhas.py`; usa SQLite em memória, não mexe no banco real).
9. **Tela fala com a cozinha**: `useApi("/api/<assunto>")` para ler; `apiPost(...)` / `apiDelete(...)` de `frontend/src/lib/api.js` para gravar. Nunca chame APIs externas direto do navegador.
10. Nada de dados pessoais reais gravados automaticamente.

## Conferir e entregar

11. `make test` (e `docker compose exec -T frontend npm run build`); corrija o que falhar.
12. Liste os arquivos alterados e termine com: "Abra **http://localhost:5193/nome-da-pagina** e confira [o que ver]". Se criou endpoint: "Ele aparece em **http://localhost:5194/docs**."
