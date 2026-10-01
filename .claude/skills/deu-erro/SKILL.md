---
name: deu-erro
description: Diagnostica e corrige erros do painel local. Use quando o usuário disser "deu erro", "não funciona", "quebrou", "tela branca", "não abre", "erro vermelho", ou colar uma mensagem de erro.
---

# Deu erro

Seja calmo e simples: "Vamos ver o que aconteceu." Explique a causa em uma frase antes de corrigir.

## Passo a passo
1. **Leia o erro inteiro** (o que o usuário colou, a saída do terminal do `npm run dev`, ou o console do navegador). Identifique arquivo e linha.
2. **Sistema está rodando?** `curl -s http://127.0.0.1:5194/health` e `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5193/`. Se não, use a skill `rodar-sistema`.
3. **Porta ocupada** (`EADDRINUSE`, "Port 5193 is already in use"): outro processo está nas portas. Veja com `lsof -i :5193 -i :5194` e encerre (ou oriente Ctrl+C no outro terminal).
4. **Token / Twygo**:
   - `curl -s http://127.0.0.1:5194/api/twygo/status` → `configured:false` = falta `.env` ou o token ainda é o texto de exemplo. Confira **só se existe**: `test -f .env && echo existe`. Nunca rode `cat .env`.
   - Para resolver: crie o `.env` (`cp .env.example .env`) se faltar, abra para o usuário (`open -e .env` no Mac, `notepad .env` no Windows), peça que cole o token depois de `TWYGO_API_TOKEN=`, salve e diga "pronto". **Nunca peça o token no chat.**
   - 401 "token inválido ou vencido" → pedir token novo ao João ou à Adriana.
   - 502 "não foi possível falar com a Twygo" → internet/VPN.
   - Mudou o `.env`? Reinicie o sistema.
5. **Node**: `node -v` precisa ser **22.12 ou mais novo**.
6. **Pacotes**: "Cannot find module" / erros esquisitos após atualizar → `rm -rf node_modules && npm install`.
7. **Tela branca**: rode `npm run build` para ver o erro de código; corrija o arquivo indicado.
8. **Confirme a correção**: `npm test` e `npm run build`, recarregue a página.

## Ao final
- Diga em uma frase o que causou o problema e o que foi feito.
- Diga qual endereço abrir para conferir.
- Se não conseguiu resolver, resuma o erro para o usuário levar ao João, à Adriana ou a um dev (sem incluir token nem dados pessoais).
