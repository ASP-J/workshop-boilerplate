# Painel do meu setor — esqueleto do Workshop de IA Twygo

## O que é

Um sisteminha **pronto para você mexer conversando com o Claude Code**. Ele já vem com:

- um painel com menu, cards, gráficos e tabelas;
- leitura de planilhas (.csv e .xlsx) direto no navegador;
- um **banco de dados** para guardar as planilhas que você quiser (elas continuam lá depois de desligar o computador);
- conexão com a lista de usuários da Twygo (com o token do workshop);
- uma página em branco, **Minha automação**, para você construir o desafio do seu setor.

Você **não precisa programar**: descreve o que quer e o Claude faz.

> 🔒 **Tudo roda só no seu computador.** Nada é publicado na internet.

## Como o sistema funciona (o restaurante)

Pense num restaurante com três partes, cada uma numa "caixinha" do Docker:

| Parte do restaurante | No sistema | O que faz |
|---|---|---|
| 🍽️ **Salão** | Tela (React) — http://localhost:5193 | É o que você vê e clica no navegador |
| 👩‍🍳 **Cozinha** | Servidor local (FastAPI, em Python) — http://localhost:5194/docs | Recebe os pedidos do salão, busca as coisas no estoque ou na Twygo e devolve prontas. É a única que conhece o token |
| 📦 **Estoque** | Banco de dados (PostgreSQL) | Guarda as planilhas que você salvou. Só a cozinha entra no estoque |

O **Docker** é o prédio do restaurante: liga as três partes juntas com um comando só, sem você instalar Node, Python ou banco de dados no seu computador.

## Pré-requisitos

1. **Docker Desktop** instalado e **aberto** (o ícone da baleia 🐳 aparece na barra do Mac ou do Windows). Baixe em <https://www.docker.com/products/docker-desktop/>.
2. **Claude Code** instalado.

Só isso. Não precisa instalar Node, Python nem banco de dados: tudo roda dentro do Docker.

> A **primeira vez** que o sistema liga demora alguns minutos (o Docker baixa as peças, uns 1,5 GB). Depois liga em segundos.

## Como abrir no Claude Code

O Claude Code precisa ser aberto **dentro da pasta do projeto**. O jeito mais fácil (funciona mesmo com espaços no nome da pasta, como "Workshop 1-10"):

**No Mac**

1. Abra o **Terminal** (Cmd + Espaço, digite "Terminal" e aperte Enter).
2. Digite `cd ` (as letras c e d e **um espaço**). Ainda não aperte Enter.
3. Arraste a pasta onde você quer trabalhar (por exemplo, a pasta do workshop) do Finder para dentro da janela do Terminal. O caminho completo aparece sozinho.
4. Aperte **Enter**.
5. Digite `claude` e aperte **Enter**.

**No Windows**

1. Abra a pasta no Explorador de Arquivos.
2. Clique na barra de endereço lá em cima, digite `cmd` (ou `powershell`) e aperte **Enter**. Um terminal abre já dentro da pasta.
   - Outra opção: abra o terminal, digite `cd ` (com espaço), arraste a pasta para dentro da janela e aperte **Enter**.
3. Digite `claude` e aperte **Enter**.

## Primeiro pedido

Com o Docker Desktop aberto e o Claude Code aberto na pasta, cole:

```text
Clone https://github.com/ASP-J/workshop-boilerplate.git, leia o CLAUDE.md e o README, suba o sistema com Docker e me diga qual endereço abrir.
```

Se você já está dentro da pasta do projeto (já clonou antes), basta:

```text
Leia o CLAUDE.md e o README, suba o sistema com Docker e me diga qual endereço abrir.
```

O endereço é **http://localhost:5193**.

## Como colocar o token da Twygo

O token é a "senha" que permite ler os usuários da Twygo. **Ele nunca vai para o chat** — você cola direto no arquivo.

1. Peça ao Claude: `Crie o .env a partir do .env.example e abra o arquivo para eu colar o token. Não peça nem mostre o token no chat.`
2. O Claude abre o arquivo `.env` no editor de texto (no Mac com `open -e .env`, no Windows com `notepad .env`).
3. Cole o token logo depois de `TWYGO_API_TOKEN=` (no lugar de `cole_o_token_do_workshop_aqui`) e **salve** (Cmd + S no Mac, Ctrl + S no Windows).
4. Volte ao Claude Code e diga: `pronto`. Ele religa o sistema (`make up`) e confere se o token funcionou.
5. Na página **Início**, o "Token da Twygo" deve aparecer como **configurado**.

Colou o token no chat sem querer? Avise o Claude: ele coloca no `.env` sem repetir o valor, e depois do workshop peça ao João ou à Adriana para trocar o token.

As páginas de planilha funcionam **sem** token.

## As 5 páginas

| Página | Endereço | O que faz |
|---|---|---|
| **Início** | http://localhost:5193/ | Como usar, se o servidor, o banco e o token estão ok, regras de ouro |
| **Minha planilha** | http://localhost:5193/planilha | Carregue um CSV/XLSX (ou o exemplo) e veja resumo, gráfico e tabela; exporte o filtrado; **salve no banco** |
| **Usuários Twygo** | http://localhost:5193/usuarios-twygo | Lista todos os usuários da Twygo com busca |
| **Cruzar planilha × Twygo** | http://localhost:5193/cruzar | Descobre quem da sua planilha (a carregada ou uma salva) existe na Twygo, pelo e-mail |
| **Minha automação** | http://localhost:5193/minha-automacao | **Sua página.** Peça ao Claude para transformá-la no seu desafio |

### Onde a planilha fica guardada

- **Ao carregar**, ela fica **só nesta aba do navegador**: continua lá se você recarregar a página, some ao fechar a aba ou ao clicar em **Limpar planilha**.
- **Ao clicar em "Salvar no banco"**, ela vai para o estoque (banco de dados **deste computador**) e aparece em **Planilhas salvas**. Continua lá mesmo depois de desligar o sistema ou o computador. Para tirar de lá, clique em **Apagar** (ou apague tudo com `make reset`).

### A planilha do workshop

`frontend/public/exemplos/capacitacao_workshop.csv` (colunas: email, area, categoria, curso, horas_capacitacao, status_capacitacao, nota, concluido_em). É a planilha do workshop e tem **e-mails REAIS de usuários da Twygo**, para dar para cruzar de verdade:

- use **só no workshop**;
- **não compartilhe** o arquivo;
- **não tire print** de tabelas que mostram e-mails;
- se salvar no banco, **apague** de lá quando terminar o workshop.

Quando o Claude criar arquivos de exemplo **novos** para a sua área, eles terão dados inventados (e-mails `@exemplo.com`).

### Como conferir (números esperados)

| Página | O que deve aparecer |
|---|---|
| **Minha planilha** → botão "Capacitação do workshop" | **287 linhas** e **8 colunas**; gráfico "Soma de horas_capacitacao por area" |
| **Usuários Twygo** (com token) | **186 usuários** |
| **Cruzar planilha × Twygo** | **150 de 160 pessoas encontradas** (271 das 287 linhas) |

Por que 287 linhas mas 160 pessoas? Cada linha é um curso, e a mesma pessoa aparece em várias linhas. Das **160 pessoas (e-mails diferentes)**, **150 existem na Twygo**. As **10 que não aparecem são de propósito**: são e-mails `@anonimizado.com` que não existem na Twygo, para você ver como fica a lista de "não encontrados".

Ideias de pedidos prontos: veja **[PROMPTS.md](PROMPTS.md)**.

## Ligar, desligar e outros comandos

Normalmente você só pede ao Claude ("suba o sistema", "desligue o sistema"). Se quiser fazer na mão, no terminal, dentro da pasta do projeto:

| O que fazer | Mac (com `make`) | Windows ou sem `make` |
|---|---|---|
| Ligar (e reconstruir se algo mudou) | `make up` | `docker compose up -d --build -V` |
| Desligar (as planilhas salvas continuam guardadas) | `make down` | `docker compose down` |
| Ver o que está acontecendo (Ctrl+C para sair) | `make logs` | `docker compose logs -f --tail=100` |
| Ver o que está ligado | `make ps` | `docker compose ps` |
| **Apagar o banco** e desligar (começar do zero) | `make reset` | `docker compose down -v` |
| Rodar os testes automáticos | `make test` | `docker compose exec -T backend pytest` e depois `docker compose exec -T frontend npm test` |

## As 8 habilidades do Claude neste projeto

Ficam em `.claude/skills/`. Você não precisa chamar pelo nome: basta pedir do seu jeito.

| Habilidade | Quando entra em ação |
|---|---|
| `rodar-sistema` | "suba o sistema", "reinicie", "desligue o sistema" |
| `nova-pagina` | "crie uma página", "quero uma aba para..." |
| `importar-planilha` | "usar minha planilha", "salvar no banco", "criar arquivo de exemplo" |
| `novo-grafico` | "adicione um gráfico", "um card com o total" |
| `cruzar-com-twygo` | "cruzar com a Twygo", "quem está na plataforma", token |
| `explicar-o-que-mudou` | "o que mudou?", "o que você fez?" |
| `deu-erro` | "deu erro", "não funciona", "tela branca" |
| `resetar-banco` | "apague o banco", "comece do zero", "mudei uma tabela" |

## ⭐ Regras de ouro

1. **Só no seu computador.** O sistema roda em `localhost` e ninguém da rede acessa.
2. **Não publique.** Nada de Vercel, Dokploy, nuvem ou GitHub público. Publicar exige auditoria do **João, da Adriana ou de um dev**. Se você pedir, o Claude vai recusar.
3. **Token é segredo.** Nunca cole no chat, em print ou em mensagem — só direto no arquivo `.env`.
4. **LGPD.** Não envie dados reais de colaboradores ou clientes para serviços externos. A planilha do workshop tem e-mails reais: use só aqui e não compartilhe.
5. **Na dúvida, pergunte ao Claude:** "isso é seguro?".

## Deu erro, e agora?

1. Copie a mensagem de erro (da tela ou do terminal).
2. Cole no Claude Code assim: `deu erro: <cole aqui>`.
3. O Claude vai explicar o que aconteceu e corrigir.

Problemas comuns:

| Sintoma | O que fazer / pedir ao Claude |
|---|---|
| "Cannot connect to the Docker daemon" / "Docker não está rodando" | Abra o **Docker Desktop**, espere a baleia 🐳 ficar parada e peça: "suba o sistema" |
| A página não abre | "suba o sistema" |
| "port is already allocated" / porta já está em uso | Outro programa está usando a porta 5193 ou 5194. Peça: "a porta está ocupada, descubra quem está usando e resolva" |
| **Página em branco** | Peça: "a página está em branco, olhe os logs e corrija" (o Claude roda `make logs`) |
| Início mostra "Banco de dados: sem conexão" | "suba o sistema" (se continuar: "deu erro: banco sem conexão") |
| Token "não configurado" | "Crie o .env a partir do .env.example e abra o arquivo para eu colar o token" (cole no arquivo, salve e diga "pronto") |
| "Token inválido ou vencido" | Peça um token novo ao João ou à Adriana |
| **Mudou uma tabela do banco** e deu erro | Peça: "resete o banco" (o Claude roda `make reset` e `make up`; **apaga as planilhas salvas**) |
| Mudou algo e quebrou | "desfaça a última mudança" ou "explique o que mudou" |

Para **desligar** o sistema: peça ao Claude "desligue o sistema" (ou rode `make down`).
