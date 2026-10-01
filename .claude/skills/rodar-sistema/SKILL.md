---
name: rodar-sistema
description: Instala, liga, abre e para o painel local do workshop. Use quando o usuário disser "rode o sistema", "liga o painel", "abre o sistema", "instala", "reinicie", "pare o sistema", "não está abrindo", ou no primeiro pedido.
---

# Rodar o sistema

Fale sempre em português simples. Nunca mostre o conteúdo do `.env`.

## Ligar

1. Confira o Node: `node -v`. Precisa ser **22.12 ou mais novo**. Se for menor, explique como instalar o Node LTS em https://nodejs.org e pare aqui.
2. Se não existir a pasta `node_modules`, rode `npm install` (diga: "estou baixando as peças do sistema, leva 1 ou 2 minutos").
3. Veja se as portas 5193/5194 já estão em uso (`lsof -i :5193 -i :5194` no Mac/Linux; no Windows `netstat -ano | findstr 5193`). Se estiverem, provavelmente o sistema **já está rodando** — confira com `curl -s http://127.0.0.1:5194/health`.
4. Rode `npm run dev` **em segundo plano** (para não travar a conversa).
5. Confirme: `curl -s http://127.0.0.1:5194/health` deve responder `{"ok":true,...}` e `curl -s http://127.0.0.1:5194/api/twygo/status` diz se o token está configurado.
6. Responda: "Pronto! Abra **http://localhost:5193** no navegador." e diga se o token está ou não configurado (sem mostrar o token).
7. Token não configurado e o usuário quer usar a Twygo? Ofereça: crio o `.env` (`cp .env.example .env`) e abro o arquivo (`open -e .env` no Mac, `notepad .env` no Windows) para você colar o token depois de `TWYGO_API_TOKEN=`; salve e me diga "pronto" que eu reinicio. **Nunca peça o token no chat.**

## Parar

- Se você mesmo iniciou em segundo plano, encerre esse processo.
- Senão: oriente "no terminal onde está rodando, aperte Ctrl + C", ou encerre os processos das portas 5193 e 5194.

## Reiniciar

Pare e ligue de novo. Necessário depois de mudar o `.env` ou arquivos de `server/`.

## Nunca

- Não troque `127.0.0.1` por `0.0.0.0` nem exponha o sistema na rede.
- Não publique em lugar nenhum (Vercel, Dokploy, nuvem, GitHub).
