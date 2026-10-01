# CLAUDE.md — instruções para o Claude Code

Este projeto é o **esqueleto do "desafio do seu setor"** do Workshop de IA da Twygo.
Cada pessoa usa este painel para automatizar uma tarefa repetitiva da sua área.

## Quem é o usuário

- **Não é programador.** Trabalha em RH, Financeiro, Vendas, Atendimento, PMO, Marketing etc.
- Vai pedir tudo em português, do jeito que fala no dia a dia.
- Não sabe (e não precisa saber) o que é React, FastAPI, Docker, porta ou terminal.
- No computador dele há **só Docker Desktop + Claude Code**. Não há Node nem Python instalados — e não devem ser instalados.

## Mac ou Windows? (descubra antes do primeiro comando)

O usuário pode estar num **Mac** ou num **Windows 10/11** (Docker Desktop com WSL 2). Descubra pelo ambiente (a plataforma aparece no seu contexto: `darwin` = Mac, `win32` = Windows; na dúvida rode `uname -s` — no Windows ele falha ou mostra `MINGW`/`MSYS`) e use os comandos certos:

| Para | Mac / Linux | Windows |
|---|---|---|
| Ligar / reconstruir | `make up` | `docker compose up -d --build -V` (o usuário pode clicar duas vezes em `iniciar.bat`) |
| Desligar | `make down` | `docker compose down` (ou `parar.bat`) |
| Logs | `make logs` / `docker compose logs --tail=80 backend` | `docker compose logs --tail=80 backend` (ou `logs.bat`) |
| Apagar o banco | `make reset` | `docker compose down -v` (ou `resetar.bat`, que pede para digitar SIM) |
| Testes | `make test` | `docker compose exec -T backend pytest` e `docker compose exec -T frontend npm test` (ou `testar.bat`) |
| Criar o `.env` | `cp .env.example .env` | `copy .env.example .env` |
| Abrir o `.env` para o usuário | `open -e .env` | `notepad .env` |
| Docker está aberto? | `docker info >/dev/null 2>&1 && echo ok` | `docker info >nul 2>&1 && echo ok` |
| Quem usa a porta? | `lsof -i :5193 -i :5194` | `netstat -ano \| findstr :5193` |

**No Windows, nunca** use `make`, `cp`, `open -e`, `lsof`, `rm -rf` nem `/dev/null` dentro do `cmd`. Prefira os comandos `docker compose ...` (funcionam igual em qualquer terminal) e diga ao usuário que ele também pode clicar duas vezes nos `.bat`. Se você estiver rodando no Git Bash do Windows, `curl` e `/dev/null` funcionam, mas para o **usuário** mostre sempre a versão do `cmd`.

- Caminhos no Windows usam barra invertida (`frontend\src\pages`) e **caminhos com espaço vão entre aspas** (`cd "C:\Users\Maria\workshop boilerplate"`). Nos comandos do `docker compose` use caminhos relativos à pasta do projeto.
- Se a pasta estiver dentro do **OneDrive** (o caminho tem `OneDrive`), avise com gentileza que pode ficar lento e sugira mover para `C:\workshop`.
- Para conferir endereços no Windows use `curl.exe` (no PowerShell, `curl` sozinho é outro comando): `curl.exe -s http://127.0.0.1:5194/health`.
- Os `.bat` aceitam `/q` para não pausar no fim (ex.: `iniciar.bat /q`), se precisar rodá-los você mesmo.
- Os `.bat` têm final de linha CRLF e os demais arquivos LF (veja `.gitattributes`). Não troque os finais de linha.
- Erros típicos do Windows (WSL 2 incompleto, virtualização desligada na BIOS, Docker no modo "Windows containers", porta ocupada, OneDrive lento): veja a seção **No Windows** do `README.md` e a skill `deu-erro`.

## Como responder (sempre)

1. **Responda em português do Brasil, sem jargão.** Se precisar usar um termo técnico, explique em uma frase. Use a analogia do restaurante: **salão** = tela (React), **cozinha** = servidor local (FastAPI), **estoque** = banco de dados (PostgreSQL), **prédio** = Docker.
2. **Antes de editar, explique o plano** em 2 a 5 tópicos curtos: o que vai fazer e em quais arquivos.
3. **Depois de editar, liste os arquivos alterados** e o que mudou em cada um, em linguagem simples.
4. **Termine sempre dizendo qual endereço abrir e como conferir**, por exemplo:
   > Abra **http://localhost:5193/minha-automacao**, clique em "RH · treinamentos" e veja o gráfico de horas por setor.
5. Se o pedido for vago, faça **no máximo 2 perguntas** objetivas ou proponha uma solução simples e pergunte se serve.
6. Se o sistema não estiver ligado, ligue (`make up`; no Windows `docker compose up -d --build -V`) ou diga como ligar.

## Regras de ouro (inegociáveis)

- **Tudo roda só no computador do usuário.** As portas do `docker-compose.yml` são publicadas **só** em `127.0.0.1` (`"127.0.0.1:${FRONTEND_PORT:-5193}:5173"`, `"127.0.0.1:${BACKEND_PORT:-5194}:8000"` — o número pode mudar pelo `.env`, o `127.0.0.1:` nunca). **Nunca** tire o `127.0.0.1:` da frente, nunca publique a porta do banco e não exponha nada na rede. (Dentro do container a tela/cozinha escutam em `0.0.0.0` — isso é obrigatório no Docker e está ok porque a porta publicada é só local.)
- **Nunca publique.** Não faça deploy nem envie para servidor, nuvem, Vercel, Netlify, Dokploy, Docker remoto/registry, GitHub público, Google Drive ou similar. Não rode `git push`, `docker push`, `vercel`, `netlify`, `gh repo create` etc.
  - Se o usuário pedir, **recuse com gentileza**: "Publicar exige uma auditoria de segurança feita pelo João, pela Adriana ou por um dev. Posso deixar tudo pronto e documentado aqui no seu computador para essa revisão."
- **Nunca instale nada no computador da pessoa.** Nada de `npm install`, `pip install`, `brew install`, `winget`, instalar Node ou Python. Tudo roda dentro do Docker. Biblioteca nova → edite `frontend/package.json` (e gere o lock **dentro do container**: `docker compose exec frontend npm install <pacote>`) ou `backend/requirements.txt` (com versão fixa `==`) e rode `make up` (reconstrói).
- **Nunca mostre, imprima, copie ou commite o `.env` ou o token.** Não rode `cat .env`, `docker compose config` (mostra o token!), `env`/`printenv` no container, nem coloque o token em código, log, print ou resposta. **Nunca peça o token no chat.** Siga sempre o fluxo de "Token da Twygo" abaixo.
  - Se o usuário colar o token no chat mesmo assim: escreva o valor no `.env` (linha `TWYGO_API_TOKEN=`), **não repita o token** na resposta, avise com gentileza que da próxima vez ele deve colar direto no arquivo e **recomende revogar/trocar o token depois do workshop** (pedir ao João ou à Adriana).
- **LGPD:** não envie dados reais de colaboradores ou clientes para serviços externos (APIs de terceiros, IAs online, encurtadores, planilhas na nuvem). Prefira **processar no navegador** (como `frontend/src/lib/parseSheet.js` já faz) ou na cozinha local. O banco é local (volume do Docker deste computador).
- **A planilha do workshop (`frontend/public/exemplos/capacitacao_workshop.csv`) tem e-mails REAIS da Twygo.** Use só no workshop, não compartilhe o arquivo, não tire print de tabelas com e-mails e não copie e-mails/nomes para suas respostas (fale em quantidades). **Arquivos de exemplo NOVOS que você criar devem ter dados inventados** (e-mails `@exemplo.com`). Nunca grave dados pessoais no banco automaticamente (seed): só o que a pessoa salvar pelo botão.
- **Somente leitura na Twygo:** use apenas `GET`. Não crie rotas que alterem ou apaguem dados na Twygo sem aprovação explícita de um dev.
- Planilhas reais da pessoa, se precisarem ficar na pasta, vão em `dados/` (está no `.gitignore`). Nunca commite planilhas reais.

## Token da Twygo (o único fluxo — siga sempre este)

O usuário **nunca** cola o token no chat. Quando ele pedir *"Crie o .env a partir do .env.example e abra o arquivo para eu colar o token"* (ou o token não estiver configurado):

1. Se ainda não existir (`test -f .env` / Windows `if exist .env echo existe`, sem abrir), crie: `cp .env.example .env` (Windows: `copy .env.example .env`).
2. Abra o arquivo no editor de texto do computador: **Mac** `open -e .env` · **Windows** `notepad .env`.
3. Diga: "Cole o token logo depois de `TWYGO_API_TOKEN=` (no lugar de `cole_o_token_do_workshop_aqui`), salve o arquivo (Cmd+S / Ctrl+S) e me diga **pronto**."
4. Quando ele disser "pronto": rode `make up` (Windows: `docker compose up -d --build -V`) — o Docker recria a cozinha com o `.env` novo, reiniciar não basta — e confira `curl -s http://127.0.0.1:5194/api/twygo/status` → `{"configured":true}`. Conte o resultado em uma frase, sem mostrar o token.

## Como o projeto é organizado

| Pasta / arquivo | O que é |
|---|---|
| `docker-compose.yml` | O "prédio": liga `postgres` (estoque), `backend` (cozinha) e `frontend` (salão) |
| `Makefile` | Atalhos (Mac/Linux): `make up`, `down`, `logs`, `ps`, `reset`, `test` |
| `iniciar.bat`, `parar.bat`, `logs.bat`, `resetar.bat`, `testar.bat` | Atalhos de clique duplo para o **Windows** (o mesmo que o `Makefile`). `iniciar.command` = clique duplo no Mac |
| `.gitattributes` | Finais de linha (LF em tudo, CRLF só nos `.bat`) para funcionar no Windows |
| `.env` / `.env.example` | Token da Twygo e senha do banco (o `.env` nunca vai para o Git) |
| **Salão (tela)** | |
| `frontend/src/config.js` | Nome do painel, setor e cor principal |
| `frontend/src/pages/index.js` | **Registro de páginas** (menu e rotas leem daqui) |
| `frontend/src/pages/*.jsx` | Uma página por arquivo |
| `frontend/src/components/` | Peças prontas (tabela abaixo) |
| `frontend/src/lib/` | Funções: `api.js` (`apiGet`/`apiPost`/`apiDelete`), `useApi.js`, `parseSheet.js` (CSV/XLSX), `aggregate.js` (groupBy/sum/average), `matchByEmail.js`, `exportCsv.js`, `sheetStore.js` (planilha carregada, guardada na aba), `planilhasSalvas.js` (planilhas no banco), `chartDefaults.js` (colunas padrão do gráfico), `twygoUsers.js` |
| `frontend/src/styles.css` | Cores e estilos (variáveis `--roxo`, `--roxo-escuro`, `--amarelo`, `--marinho`, `--lavanda`, `--grafico-1..8`) |
| `frontend/public/exemplos/` | A planilha do workshop (`capacitacao_workshop.csv`, **e-mails reais** — só para o workshop). É servida como arquivo estático em `/exemplos/...` |
| **Cozinha (servidor local)** | |
| `backend/app/main.py` | Liga a cozinha, registra os routers, erros amigáveis |
| `backend/app/routers/` | Um arquivo por assunto: `health.py`, `twygo.py`, `planilhas.py` (**modelo** para endpoint com banco) |
| `backend/app/models.py` | Tabelas do banco (SQLAlchemy 2) |
| `backend/app/schemas.py` | Formato dos dados que entram e saem (Pydantic) |
| `backend/app/db.py` | Conexão com o banco (`get_db`) |
| `backend/app/erros.py` | `ErroAmigavel(status, mensagem, código)` → a tela recebe `{message, code}` |
| `backend/app/seed.py` | Dados iniciais (vazio de propósito) |
| `backend/tests/` | Testes pytest (SQLite em memória + Twygo falsa: não mexem no banco real nem na internet) |

Endereços: tela **http://localhost:5193** · cozinha **http://localhost:5194** (documentação interativa em **http://localhost:5194/docs**) · banco **sem porta** (só a cozinha acessa). A tela repassa `/api` e `/health` para a cozinha (`frontend/vite.config.js`).

### Endpoints que já existem

| Endpoint | Resposta |
|---|---|
| `GET /health` | `{"ok": true, "db": true}` (`db: false` = banco não respondeu) |
| `GET /api/twygo/status` | `{"configured": true\|false}` (nunca o token) |
| `GET /api/twygo/users?all=true` | `{ data: { users: [{user_id, name, email, department}], pagination: {total_entries, total_pages} } }` (todas as páginas, 100 por vez). `?page=2` = só uma página. 503 sem token, 401 token inválido |
| `POST /api/planilhas` | recebe `{nome, colunas, linhas, colunas_numericas?}` (máx. 20.000 linhas) → `{id, nome, n_linhas, n_colunas, criado_em}` |
| `GET /api/planilhas` | lista (sem as linhas) |
| `GET /api/planilhas/{id}` | planilha inteira |
| `DELETE /api/planilhas/{id}` | `{"ok": true}` |

## Convenções

- **Página nova** = criar `frontend/src/pages/NomeDaPagina.jsx` + **uma linha** em `frontend/src/pages/index.js` (`{ path, label, icon, component }`). Não mexa no `App.jsx` para isso.
- **Reaproveite** os componentes de `frontend/src/components/` e as funções de `frontend/src/lib/` antes de criar algo novo.
- **Use as variáveis de cor** do `styles.css` (`var(--roxo)`), nunca cores soltas.
- **Código simples:** JavaScript puro na tela (sem TypeScript), Python simples na cozinha, arquivos pequenos (idealmente até ~150 linhas), comentários em português explicando o "porquê".
- Lógica de cálculo da tela vai em `frontend/src/lib/` com um teste `*.test.js` ao lado (vitest). Endpoint novo na cozinha ganha teste em `backend/tests/` (pytest).
- Dados novos da Twygo: crie o endpoint em `backend/app/routers/twygo.py` — o navegador **nunca** fala direto com `api.twygo.com` e nunca recebe o token. Só devolva os campos que a tela usa.
- Novas dependências: só se for realmente necessário, e nunca o pacote `xlsx` (tem vulnerabilidade; use `read-excel-file`).
- O código de `frontend/src` e `backend/app` **recarrega sozinho** ao salvar. Precisa de `make up` (rebuild) quando mudar `package.json`, `requirements.txt`, `docker-compose.yml`, `Dockerfile` ou `.env`.
- Mudou uma tabela em `models.py` (coluna nova, nome trocado)? A cozinha só **cria** tabelas que não existem. Avise que vai apagar as planilhas salvas e rode `make reset` + `make up` (skill `resetar-banco`).
- **Depois de cada mudança rode `make test`** (pytest + vitest dentro dos containers) e, se mexeu na tela, `docker compose exec -T frontend npm run build`. Se algo falhar, corrija antes de entregar. Conte ao usuário o resultado em uma linha ("testes ok, build ok").

## Peças prontas (props) — use estes nomes, não invente

| Componente (`frontend/src/components/`) | Props | Exemplo |
|---|---|---|
| `KpiCard` | `rotulo`, `valor`, `dica?`, `cor?` (`"roxo"` padrão, `"amarelo"`, `"escuro"`, `"verde"`, `"vermelho"`) | `<KpiCard rotulo="Total" valor={120} dica="linhas" cor="amarelo" />` |
| `ChartCard` | `titulo`, `descricao?`, `dados` (`[{ name, value }]`), `tipo?` (`"barra"` padrão ou `"pizza"`), `altura?` (300), `children?` (filtros acima do gráfico) | `<ChartCard titulo="Horas por área" dados={dados} tipo="pizza" />` |
| `DataTable` | `linhas`, `colunas?` (padrão: chaves da 1ª linha), `titulos?` (`{ coluna: "Título" }`), `limite?` (200), `nomeArquivo?` ("dados.csv"), `busca?` (true), `titulo?` | `<DataTable linhas={rows} colunas={["area", "curso"]} nomeArquivo="cursos.csv" />` |
| `FileUpload` | `onArquivo(file)`, `aceita?` (".csv,.xlsx"), `texto?` | `<FileUpload onArquivo={(f) => ...} />` |
| `SheetLoader` | (nenhuma) — upload + botão da planilha do workshop; guarda no `sheetStore`. Exporta também `SheetBar` (`sheet`) com "Salvar no banco" e "Limpar planilha" | `<SheetLoader />` · `<SheetBar sheet={sheet} />` |
| `PlanilhasSalvas` | (nenhuma) — lista do banco com "Abrir"/"Apagar". Exporta também `SalvarNoBanco` (`sheet`) e `EscolherPlanilhaSalva` (`sheet`) | `<PlanilhasSalvas />` · `<EscolherPlanilhaSalva sheet={sheet} />` |
| `EmptyState` | `titulo`, `texto?`, `icone?` ("📭"), `children?` | `<EmptyState titulo="Nada por aqui" texto="Carregue uma planilha." />` |
| `LoadingState` | `texto?` ("Carregando...") | `<LoadingState texto="Buscando..." />` |
| `ErrorState` | `titulo?` ("Algo deu errado"), `mensagem?` (também aceita `texto`), `onTentarDeNovo?`, `children?` | `<ErrorState mensagem="Falhou" onTentarDeNovo={recarregar} />` |
| `RulesBox` | (nenhuma) — regras de ouro (página Início) | `<RulesBox />` |

Planilha carregada: `const sheet = useSheet()` → `{ fileName, columns, rows, numericColumns, persisted, savedId? }` ou `null`. `setSheet(sheet)` guarda, `clearSheet()` apaga. Fica no `sessionStorage` da aba (sobrevive a recarregar a página, some ao fechar a aba); se for grande demais, fica só na memória (`persisted: false`). `savedId` = está salva no banco.

Planilhas no banco (`frontend/src/lib/planilhasSalvas.js`): `listarPlanilhas()`, `salvarPlanilha(sheet)`, `abrirPlanilha(id)` (devolve um `sheet` pronto para `setSheet`), `apagarPlanilha(id)`.

## Receitas

### "Nova página" (só tela)
1. Copie `frontend/src/pages/MinhaAutomacao.jsx` para `frontend/src/pages/NomeNovo.jsx` e ajuste.
2. Em `frontend/src/pages/index.js`: `import NomeNovo from "./NomeNovo.jsx";` e adicione `{ path: "/nome-novo", label: "Nome novo", icon: "📌", component: NomeNovo }`.
3. `make test`. Diga: abra http://localhost:5193/nome-novo.

### "Nova página + endpoint + tabela" (guardar algo no banco)
Exemplo: "quero registrar as metas do meu time e ver numa página".
1. **Tabela** — em `backend/app/models.py`, crie uma classe (copie `Planilha` como base):
   ```python
   class Meta(Base):
       __tablename__ = "metas"
       id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
       titulo: Mapped[str] = mapped_column(String(200), nullable=False)
       valor: Mapped[float] = mapped_column(Float, nullable=False, default=0)
       criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora)
   ```
   (Importe o que usar no topo: `from sqlalchemy import Float, ...`.) Tabela **nova** é criada sozinha ao salvar (a cozinha reinicia). Se **mudou** uma tabela que já existia → `make reset` + `make up` (avise que apaga as planilhas salvas).
2. **Formato** — em `backend/app/schemas.py`: `MetaEntrada` (o que chega) e `MetaSaida` (com `model_config = ConfigDict(from_attributes=True)`).
3. **Endpoint** — crie `backend/app/routers/metas.py` copiando `planilhas.py` (`APIRouter(prefix="/api/metas")`, `db: Session = Depends(get_db)`, erros com `ErroAmigavel`). Registre em `backend/app/main.py`: `from app.routers import metas` e `app.include_router(metas.router)`.
4. **Teste** — `backend/tests/test_metas.py` usando a fixture `client` (veja `test_planilhas.py`).
5. **Tela** — página nova (receita acima) usando `useApi("/api/metas")` para listar e `apiPost("/api/metas", {...})` / `apiDelete(...)` para gravar/apagar.
6. `make test`; confira em http://localhost:5194/docs (o endpoint aparece lá) e na página nova.

### "Importar planilha nova"
- Para o usuário usar a própria planilha: ele arrasta o arquivo em **Minha planilha**; outras páginas leem com `const sheet = useSheet()`. Para guardar de vez: botão **Salvar no banco**.
- Os nomes de coluna são normalizados (minúsculas, sem acento, espaço vira `_`). Ex.: "Centro de Custo" → `centro_de_custo`.
- Para um novo arquivo de exemplo: coloque em `frontend/public/exemplos/` (dados **inventados**, e-mails `@exemplo.com`) e adicione em `EXEMPLOS` no `frontend/src/components/SheetLoader.jsx`.
- Nunca copie planilhas com dados reais para dentro do projeto (se precisar, `dados/`, fora do Git).

### "Novo gráfico"
```jsx
const dados = groupBy(rows, "categoria", "valor");          // soma "valor" por "categoria"
<ChartCard titulo="Despesas por categoria" dados={dados} />  // tipo="pizza" para pizza
```
Para gráfico de linha/tempo, use Recharts (`LineChart`) dentro de um `<div className="card">`, com cores de `chartPalette()` (exportado por `ChartCard.jsx`). **Nunca agrupe por e-mail, nome ou id** (use `pickDefaultChartColumns` de `chartDefaults.js` para o padrão).

### "Cruzar com a Twygo"
- Usuários: `useApi("/api/twygo/users?all=true")` → `presentUsers(dados).users` (`{ id, nome, email, departamento }`).
- Privacidade: a cozinha devolve **só** `user_id`, `name`, `email`, `department` (`pick_user_fields` em `backend/app/routers/twygo.py`) + a paginação. Telefone, endereço, CEP e documentos não chegam ao navegador. Precisa de outro campo? Adicione lá, com teste, e só se a tela usar.
- Cruzamento: `matchByEmail(rows, "email", users)` → `{ matched: [{row, user}], unmatched, total, emails: { total, matched } }` (`total` = linhas; `emails` = pessoas/e-mails diferentes).
- Se der 503 → falta token (ver fluxo do token). 401 → token inválido/vencido.

### "Deu erro"
Use a skill `deu-erro`. Resumo: Docker Desktop aberto? (`docker info`) → `make ps` → `make logs` (ou `docker compose logs --tail=80 backend`) → leia o erro, explique em uma frase, corrija → `make test`.

## Como conferir

- Tela: **http://localhost:5193** (Início mostra servidor, banco e token).
- Cozinha: **http://localhost:5194/docs** (testa os endpoints no navegador) e `curl -s http://127.0.0.1:5194/health` → `{"ok":true,"db":true}`.
- Logs: `make logs` (Ctrl+C para sair) ou `docker compose logs --tail=80 backend`.
- Testes: `make test`.

### Números esperados com a planilha do workshop

Fale só em quantidades, nunca liste e-mails ou nomes:

| Página | O que deve aparecer |
|---|---|
| **Minha planilha** (botão "Capacitação do workshop") | **287 linhas**, **8 colunas** (2 numéricas). Gráfico padrão: **Soma de horas_capacitacao por area** |
| **Usuários Twygo** (com token) | **186 usuários** |
| **Cruzar planilha × Twygo** | **Pessoas encontradas: 150 de 160** · 287 linhas na planilha, 271 linhas encontradas, 16 não encontradas |

Linhas × pessoas: a planilha tem uma linha por curso, então a mesma pessoa aparece em várias linhas. São **160 e-mails diferentes**; **150 existem na Twygo**. Os **10 que não são encontrados são de propósito**: são endereços `@anonimizado.com` que não existem na Twygo. Esses 10 respondem pelas 16 linhas não encontradas.

Se o gráfico padrão de "Minha planilha" agrupar por e-mail, nome ou id, algo quebrou: o padrão vem de `pickDefaultChartColumns` (`frontend/src/lib/chartDefaults.js`), que pula colunas que identificam pessoas.

## Comandos

```bash
make up      # liga tudo (banco + cozinha + tela) e reconstrói se algo mudou → http://localhost:5193
make down    # desliga (as planilhas salvas continuam no banco)
make logs    # mostra o que está acontecendo (Ctrl+C para sair)
make ps      # mostra o que está ligado
make reset   # APAGA o banco local e desliga (depois: make up)
make test    # testes da cozinha (pytest) e da tela (vitest), dentro dos containers
```

No Windows: clique duplo em `iniciar.bat`, `parar.bat`, `logs.bat`, `resetar.bat`, `testar.bat` — ou, sem `make`: `docker compose up -d --build -V` · `docker compose down` · `docker compose logs -f --tail=100` · `docker compose ps` · `docker compose down -v` · `docker compose exec -T backend pytest` e `docker compose exec -T frontend npm test`.
