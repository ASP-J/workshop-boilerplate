---
name: importar-planilha
description: Usa uma planilha (CSV ou XLSX) no painel — do usuário ou um novo arquivo de exemplo. Use quando o usuário disser "importar planilha", "usar minha planilha", "ler meu Excel", "criar arquivo de exemplo", "carregar CSV".
---

# Importar planilha

## LGPD primeiro
- **Não copie planilhas com dados reais para dentro do projeto** e não envie para serviços externos.
- A planilha do workshop (`public/exemplos/capacitacao_workshop.csv`) é a exceção combinada: tem **e-mails reais da Twygo**, só para o workshop. Não compartilhe, não liste e-mails nas respostas e lembre o usuário de não tirar print de tabelas com e-mails.
- Planilha carregada fica no `sessionStorage` da aba (sobrevive a recarregar, some ao fechar a aba ou em "Limpar planilha").
- O usuário carrega o arquivo dele pela página **Minha planilha** (http://localhost:5193/planilha). A leitura acontece no navegador; nada sai do PC.
- Se o usuário pedir para você "ler" uma planilha real dele, pergunte se tem dados pessoais e sugira trabalhar com um exemplo inventado com as **mesmas colunas**.

## Como a leitura funciona
- `src/lib/parseSheet.js` → `{ columns, rows, numericColumns }`.
- Colunas são normalizadas: minúsculas, sem acento, espaço/hífen vira `_` ("Centro de Custo" → `centro_de_custo`, "E-mail" → `e_mail`).
- Números no formato BR ("1.234,56", "R$ 10") viram número. Datas do XLSX viram `AAAA-MM-DD`.
- Outras páginas leem a planilha carregada com `useSheet()`.

## Novo arquivo de exemplo
1. Crie `public/exemplos/<setor>_<assunto>.csv` com ~40 linhas **inventadas**, nomes brasileiros plausíveis, e-mails `@exemplo.com`, datas `AAAA-MM-DD`, valores com ponto decimal.
2. Adicione em `EXEMPLOS` em `src/components/SheetLoader.jsx`: `{ arquivo: "...csv", rotulo: "Setor · assunto" }`.
3. `npm test && npm run build`.
4. Termine: "Abra http://localhost:5193/planilha e clique em '<rótulo>'".

## Excel com várias abas ou formato estranho
- Hoje lemos a **primeira aba** do .xlsx. Para outra aba, ajuste `parseSheetFile` (`readSheet(file, "Nome da aba")` ou `readSheet(file, 2)`).
- Se o cabeçalho não está na primeira linha, sugira ao usuário salvar como CSV com o cabeçalho na linha 1, ou ajuste `fromMatrix`.
- Nunca instale o pacote `xlsx` (vulnerável).
