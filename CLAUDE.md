# CLAUDE.md — instruções para o Claude Code

Este projeto é o **esqueleto do "desafio do seu setor"** do Workshop de IA da Twygo.
Cada pessoa usa este painel para automatizar uma tarefa repetitiva da sua área.

## Quem é o usuário

- **Não é programador.** Trabalha em RH, Financeiro, Vendas, Atendimento, PMO, Marketing etc.
- Vai pedir tudo em português, do jeito que fala no dia a dia.
- Não sabe (e não precisa saber) o que é React, Express, porta ou terminal.

## Como responder (sempre)

1. **Responda em português do Brasil, sem jargão.** Se precisar usar um termo técnico, explique em uma frase ("o servidor local é o programa que roda no seu computador e conversa com a Twygo").
2. **Antes de editar, explique o plano** em 2 a 5 tópicos curtos: o que vai fazer e em quais arquivos.
3. **Depois de editar, liste os arquivos alterados** e o que mudou em cada um, em linguagem simples.
4. **Termine sempre dizendo qual endereço abrir e como conferir**, por exemplo:
   > Abra **http://localhost:5193/minha-automacao**, clique em "RH · treinamentos" e veja o gráfico de horas por setor.
5. Se o pedido for vago, faça **no máximo 2 perguntas** objetivas ou proponha uma solução simples e pergunte se serve.
6. Se o sistema não estiver rodando, rode (`npm run dev`) ou diga como rodar.

## Regras de ouro (inegociáveis)

- **Tudo roda só no computador do usuário** (127.0.0.1 / localhost). Não troque o host para `0.0.0.0` nem exponha portas.
- **Nunca publique.** Não faça deploy nem envie para servidor, nuvem, Vercel, Netlify, Dokploy, Docker remoto, GitHub público, Google Drive ou similar. Não rode `git push`, `vercel`, `netlify`, `gh repo create` etc.
  - Se o usuário pedir, **recuse com gentileza**: "Publicar exige uma auditoria de segurança feita pelo João, pela Adriana ou por um dev. Posso deixar tudo pronto e documentado aqui no seu computador para essa revisão."
- **Nunca mostre, imprima, copie ou commite o `.env` ou o token.** Não rode `cat .env`, não coloque o token em código, log, print ou resposta. **Nunca peça o token no chat.** Siga sempre o fluxo de "Token da Twygo" abaixo.
  - Se o usuário colar o token no chat mesmo assim: escreva o valor no `.env` (linha `TWYGO_API_TOKEN=`), **não repita o token** na resposta, avise com gentileza que da próxima vez ele deve colar direto no arquivo e **recomende revogar/trocar o token depois do workshop** (pedir ao João ou à Adriana).
- **LGPD:** não envie dados reais de colaboradores ou clientes para serviços externos (APIs de terceiros, IAs online, encurtadores, planilhas na nuvem). Prefira **processar no navegador** (como `src/lib/parseSheet.js` já faz).
- **A planilha do workshop (`public/exemplos/capacitacao_workshop.csv`) tem e-mails REAIS da Twygo.** Use só no workshop, não compartilhe o arquivo, não tire print de tabelas com e-mails e não copie e-mails/nomes para suas respostas (fale em quantidades). **Arquivos de exemplo NOVOS que você criar devem ter dados inventados** (e-mails `@exemplo.com`).
- **Somente leitura na Twygo:** use apenas `GET`. Não crie rotas que alterem ou apaguem dados na Twygo sem aprovação explícita de um dev.
- Não instale bancos de dados, Docker ou serviços externos. Este projeto roda só com **Node 22.12 ou mais novo**.

## Token da Twygo (o único fluxo — siga sempre este)

O usuário **nunca** cola o token no chat. Quando ele pedir *"Crie o .env a partir do .env.example e abra o arquivo para eu colar o token"* (ou o token não estiver configurado):

1. Se ainda não existir (`test -f .env`, sem abrir), crie: `cp .env.example .env` (Windows: `copy .env.example .env`).
2. Abra o arquivo no editor de texto do computador: **Mac** `open -e .env` · **Windows** `notepad .env`.
3. Diga: "Cole o token logo depois de `TWYGO_API_TOKEN=` (no lugar de `cole_o_token_do_workshop_aqui`), salve o arquivo (Cmd+S / Ctrl+S) e me diga **pronto**."
4. Quando ele disser "pronto": reinicie o sistema (pare e rode `npm run dev` de novo) e confira `curl -s http://127.0.0.1:5194/api/twygo/status` → `{"configured":true}`. Conte o resultado em uma frase, sem mostrar o token.

## Como o projeto é organizado

| Pasta / arquivo | O que é |
|---|---|
| `src/config.js` | Nome do painel, setor e cor principal |
| `src/pages/index.js` | **Registro de páginas** (menu e rotas leem daqui) |
| `src/pages/*.jsx` | Uma página por arquivo |
| `src/components/` | Peças prontas: `KpiCard`, `ChartCard` (barra/pizza), `DataTable` (busca, ordenação, exportar CSV), `FileUpload`, `SheetLoader`, `EmptyState`, `LoadingState`, `ErrorState`, `RulesBox` |
| `src/lib/` | Funções: `api.js` (falar com o servidor), `useApi.js`, `parseSheet.js` (CSV/XLSX), `aggregate.js` (groupBy/sum/average), `matchByEmail.js`, `exportCsv.js`, `sheetStore.js` (planilha carregada, compartilhada entre páginas, guardada na aba), `chartDefaults.js` (colunas padrão do gráfico), `twygoUsers.js` |
| `src/styles.css` | Cores e estilos (variáveis `--roxo`, `--amarelo`, `--marinho`, `--lavanda`, `--grafico-1..8`) |
| `server/app.js` | Rotas do servidor local (`/health`, `/api/twygo/status`, `/api/twygo/users`) |
| `server/twygoApi.js` | Conversa com a API da Twygo (paginação completa, token só aqui) |
| `public/exemplos/` | A planilha do workshop (`capacitacao_workshop.csv`, com **e-mails reais** da Twygo — só para o workshop). É a única: use só ela, a não ser que o usuário peça outra (nesse caso, crie com dados inventados) |

Portas: tela **5193**, servidor **5194**. A tela repassa `/api` para o servidor (ver `vite.config.js`).

## Convenções

- **Página nova** = criar `src/pages/NomeDaPagina.jsx` + **uma linha** em `src/pages/index.js` (`{ path, label, icon, component }`). Não mexa no `App.jsx` para isso.
- **Reaproveite** os componentes de `src/components/` e as funções de `src/lib/` antes de criar algo novo.
- **Use as variáveis de cor** do `styles.css` (`var(--roxo)`), nunca cores soltas.
- **Código simples:** JavaScript puro (sem TypeScript), arquivos pequenos (idealmente até ~150 linhas), comentários em português explicando o "porquê".
- Lógica de cálculo vai em `src/lib/` com um teste `*.test.js` ao lado (vitest).
- Dados novos da Twygo: crie a rota em `server/app.js` usando `server/twygoApi.js` — o navegador **nunca** fala direto com `api.twygo.com` e nunca recebe o token.
- Novas dependências: só se for realmente necessário, e nunca o pacote `xlsx` (tem vulnerabilidade; use `read-excel-file`).
- **Depois de cada mudança rode `npm test` e `npm run build`.** Se algo falhar, corrija antes de entregar. Conte ao usuário o resultado em uma linha ("testes ok, build ok").

## Peças prontas (props) — use estes nomes, não invente

| Componente (`src/components/`) | Props | Exemplo |
|---|---|---|
| `KpiCard` | `rotulo`, `valor`, `dica?`, `cor?` (`"roxo"` padrão, `"amarelo"`, `"escuro"`, `"verde"`, `"vermelho"`) | `<KpiCard rotulo="Total" valor={120} dica="linhas" cor="amarelo" />` |
| `ChartCard` | `titulo`, `descricao?`, `dados` (`[{ name, value }]`), `tipo?` (`"barra"` padrão ou `"pizza"`), `altura?` (300), `children?` (filtros acima do gráfico) | `<ChartCard titulo="Horas por área" dados={dados} tipo="pizza" />` |
| `DataTable` | `linhas`, `colunas?` (padrão: chaves da 1ª linha), `titulos?` (`{ coluna: "Título" }`), `limite?` (200), `nomeArquivo?` ("dados.csv"), `busca?` (true), `titulo?` | `<DataTable linhas={rows} colunas={["area", "curso"]} nomeArquivo="cursos.csv" />` |
| `FileUpload` | `onArquivo(file)`, `aceita?` (".csv,.xlsx"), `texto?` | `<FileUpload onArquivo={(f) => ...} />` |
| `SheetLoader` | (nenhuma) — upload + botão da planilha do workshop; guarda no `sheetStore`. Exporta também `SheetBar` (`sheet`) com "Limpar planilha" | `<SheetLoader />` · `<SheetBar sheet={sheet} />` |
| `EmptyState` | `titulo`, `texto?`, `icone?` ("📭"), `children?` | `<EmptyState titulo="Nada por aqui" texto="Carregue uma planilha." />` |
| `LoadingState` | `texto?` ("Carregando...") | `<LoadingState texto="Buscando..." />` |
| `ErrorState` | `titulo?` ("Algo deu errado"), `mensagem?` (também aceita `texto`), `onTentarDeNovo?`, `children?` | `<ErrorState mensagem="Falhou" onTentarDeNovo={recarregar} />` |

Planilha carregada: `const sheet = useSheet()` → `{ fileName, columns, rows, numericColumns, persisted }` ou `null`. `setSheet(sheet)` guarda, `clearSheet()` apaga. Fica no `sessionStorage` da aba (sobrevive a recarregar a página, some ao fechar a aba); se for grande demais, fica só na memória (`persisted: false`).

## Receitas

### "Nova página"
1. Copie `src/pages/MinhaAutomacao.jsx` para `src/pages/NomeNovo.jsx` e ajuste.
2. Em `src/pages/index.js`: `import NomeNovo from "./NomeNovo.jsx";` e adicione `{ path: "/nome-novo", label: "Nome novo", icon: "📌", component: NomeNovo }`.
3. `npm test && npm run build`. Diga: abra http://localhost:5193/nome-novo.

### "Importar planilha nova"
- Para o usuário usar a própria planilha: ele arrasta o arquivo em **Minha planilha**; outras páginas leem com `const sheet = useSheet()` (`{ columns, rows, numericColumns, fileName }`).
- Os nomes de coluna são normalizados (minúsculas, sem acento, espaço vira `_`). Ex.: "Centro de Custo" → `centro_de_custo`.
- Para um novo arquivo de exemplo: coloque em `public/exemplos/` (dados **inventados**, e-mails `@exemplo.com`) e adicione em `EXEMPLOS` no `src/components/SheetLoader.jsx`.
- Nunca copie planilhas com dados reais para dentro do projeto.

### "Novo gráfico"
```jsx
const dados = groupBy(rows, "categoria", "valor");          // soma "valor" por "categoria"
<ChartCard titulo="Despesas por categoria" dados={dados} />  // tipo="pizza" para pizza
```
Para gráfico de linha/tempo, use Recharts (`LineChart`) dentro de um `<div className="card">`, com cores de `chartPalette()` (exportado por `ChartCard.jsx`).

### "Cruzar com a Twygo"
- Usuários: `useApi("/api/twygo/users?all=true")` → `presentUsers(dados).users` (`{ id, nome, email, departamento }`).
- Privacidade: o servidor devolve **só** `user_id`, `name`, `email`, `department` de cada usuário (`pickUserFields` em `server/twygoApi.js`) + a paginação. Telefone, endereço, CEP e documentos não chegam ao navegador. Precisa de outro campo? Adicione lá, com teste, e só se a tela usar.
- Cruzamento: `matchByEmail(rows, "email", users)` → `{ matched: [{row, user}], unmatched, total, emails: { total, matched } }` (`total` = linhas; `emails` = pessoas/e-mails diferentes).
- Se der 503 → falta token (ver "deu erro"). 401 → token inválido/vencido.

### "Deu erro"
1. Leia a mensagem inteira (terminal e tela). Explique em uma frase o que significa.
2. Porta ocupada (`EADDRINUSE` / "Port 5193 is already in use") → outro terminal ainda está rodando; pare-o (Ctrl+C) ou encerre o processo da porta 5193/5194.
3. "Não consegui falar com o servidor local" → o servidor não está rodando: `npm run dev`.
4. Token: confira se o `.env` **existe** (sem mostrar o conteúdo) e se `/api/twygo/status` responde `configured: true`. Se não, siga o fluxo "Token da Twygo" acima (abrir o `.env` para o usuário colar). Depois de mudar o `.env`, reinicie o sistema.
5. `node -v` deve ser 22.12 ou mais novo. Se for menor, oriente instalar o Node LTS em nodejs.org.
6. Erros estranhos de pacote → apague `node_modules` e rode `npm install` de novo.
7. Rode `npm test` e `npm run build` para achar o arquivo com problema.

## Como conferir (números esperados com a planilha do workshop)

Use estes números para confirmar que está tudo certo (fale só em quantidades, nunca liste e-mails ou nomes):

| Página | O que deve aparecer |
|---|---|
| **Minha planilha** (botão "Capacitação do workshop") | **287 linhas**, **8 colunas** (2 numéricas). Gráfico padrão: **Soma de horas_capacitacao por area** |
| **Usuários Twygo** (com token) | **186 usuários** |
| **Cruzar planilha × Twygo** | **Pessoas encontradas: 150 de 160** · 287 linhas na planilha, 271 linhas encontradas, 16 não encontradas |

Linhas × pessoas: a planilha tem uma linha por curso, então a mesma pessoa aparece em várias linhas. São **160 e-mails diferentes**; **150 existem na Twygo**. Os **10 que não são encontrados são de propósito**: são endereços `@anonimizado.com` que não existem na Twygo (servem para mostrar a lista de "não encontrados"). Esses 10 respondem pelas 16 linhas não encontradas.

Se o gráfico padrão de "Minha planilha" agrupar por e-mail, nome ou id, algo quebrou: o padrão vem de `pickDefaultChartColumns` (`src/lib/chartDefaults.js`), que pula colunas que identificam pessoas.

## Comandos

```bash
node -v         # precisa ser 22.12 ou mais novo
npm install     # primeira vez
npm run dev     # liga tela (5193) + servidor (5194). Parar: Ctrl+C
npm test        # testes automáticos
npm run build   # confere se a tela compila
```
