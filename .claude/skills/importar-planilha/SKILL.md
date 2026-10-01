---
name: importar-planilha
description: Usa uma planilha (CSV ou XLSX) no painel — do usuário ou um novo arquivo de exemplo — e guarda no banco quando pedido. Use quando o usuário disser "importar planilha", "usar minha planilha", "ler meu Excel", "criar arquivo de exemplo", "carregar CSV", "salvar no banco", "guardar a planilha", "não quero perder a planilha".
---

# Importar planilha

> **Windows?** Não existe `make`, `cp` nem `open -e`: use os comandos `docker compose ...` (ou os `.bat` da pasta) e `copy` / `notepad`. Tabela completa no `CLAUDE.md` (seção "Mac ou Windows?").

## LGPD primeiro
- **Não copie planilhas com dados reais para dentro do projeto** e não envie para serviços externos. Se precisar ficar na pasta, use `dados/` (fora do Git).
- A planilha do workshop (`frontend/public/exemplos/capacitacao_workshop.csv`) é a exceção combinada: tem **e-mails reais da Twygo**, só para o workshop. Não compartilhe, não liste e-mails nas respostas e lembre o usuário de não tirar print de tabelas com e-mails.
- O usuário carrega o arquivo dele pela página **Minha planilha** (http://localhost:5193/planilha). A leitura acontece no navegador.
- Se o usuário pedir para você "ler" uma planilha real dele, pergunte se tem dados pessoais e sugira trabalhar com um exemplo inventado com as **mesmas colunas**.

## Onde a planilha fica
- **Carregada**: `sessionStorage` da aba (sobrevive a recarregar, some ao fechar a aba ou em "Limpar planilha").
- **Salva no banco** (botão **Salvar no banco**): vai para o PostgreSQL local (`POST /api/planilhas`, linhas em JSONB, até 20.000 linhas) e aparece em **Planilhas salvas** (Abrir/Apagar). Continua lá depois de `make down` ou desligar o computador. Some com **Apagar** ou `make reset`.
- Em código: `salvarPlanilha(sheet)`, `listarPlanilhas()`, `abrirPlanilha(id)` → `setSheet(...)`, `apagarPlanilha(id)` (`frontend/src/lib/planilhasSalvas.js`).
- Quer conferir o banco? `curl -s http://127.0.0.1:5194/api/planilhas` e fale **só nomes e quantidades**.

## Como a leitura funciona
- `frontend/src/lib/parseSheet.js` → `{ columns, rows, numericColumns }`.
- Colunas são normalizadas: minúsculas, sem acento, espaço/hífen vira `_` ("Centro de Custo" → `centro_de_custo`, "E-mail" → `e_mail`).
- Números no formato BR ("1.234,56", "R$ 10") viram número. Datas do XLSX viram `AAAA-MM-DD`.
- Outras páginas leem a planilha carregada com `useSheet()`.

## Novo arquivo de exemplo
1. Crie `frontend/public/exemplos/<setor>_<assunto>.csv` com ~40 linhas **inventadas**, nomes brasileiros plausíveis, e-mails `@exemplo.com`, datas `AAAA-MM-DD`, valores com ponto decimal.
2. Adicione em `EXEMPLOS` em `frontend/src/components/SheetLoader.jsx`: `{ arquivo: "...csv", rotulo: "Setor · assunto" }`.
3. `make test`.
4. Termine: "Abra http://localhost:5193/planilha e clique em '<rótulo>'. Se quiser guardar, clique em **Salvar no banco**."

## Excel com várias abas ou formato estranho
- Hoje lemos a **primeira aba** do .xlsx. Para outra aba, ajuste `parseSheetFile` (`readSheet(file, "Nome da aba")` ou `readSheet(file, 2)`).
- Se o cabeçalho não está na primeira linha, sugira ao usuário salvar como CSV com o cabeçalho na linha 1, ou ajuste `fromMatrix`.
- Nunca instale o pacote `xlsx` (vulnerável). Dependência nova só em `frontend/package.json` + `make up`, nunca `npm install` no computador da pessoa.
