---
name: resetar-banco
description: Apaga o banco de dados local e recria do zero (make reset + make up). Use quando o usuário disser "resete o banco", "apague o banco", "comece do zero", "limpar tudo", "apagar as planilhas salvas", ou quando uma tabela mudou em backend/app/models.py e aparece erro de coluna inexistente.
---

# Resetar o banco

O banco (estoque) guarda as **planilhas salvas**. Resetar **apaga tudo que está nele** — não tem volta. Os arquivos do projeto e a planilha do workshop (`frontend/public/exemplos/`) **não** são apagados.

## Quando é necessário
- Mudou uma tabela já existente em `backend/app/models.py` (coluna nova, nome trocado, tipo trocado): a cozinha só **cria** tabelas que não existem, não altera as antigas. Sintomas: `UndefinedColumn`, `column ... does not exist`.
- Mudou `POSTGRES_USER`, `POSTGRES_PASSWORD` ou `POSTGRES_DB` no `.env` depois de já ter ligado o sistema (sintoma: `password authentication failed`).
- O usuário quer começar do zero ou apagar dados do workshop (ex.: a planilha com e-mails reais salva no banco).

## Passo a passo
1. **Avise e peça ok**: "Isso apaga todas as planilhas salvas no banco deste computador (hoje são N). Posso continuar?" Para contar sem expor dados: `curl -s http://127.0.0.1:5194/api/planilhas` e diga só quantas são e os nomes dos arquivos.
   - Quer guardar alguma antes? Sugira abrir e usar "Exportar CSV" na página Minha planilha.
2. Com o ok: `make reset` (sem `make`: `docker compose down -v`). Isso desliga tudo e apaga o volume do banco.
3. Religue: `make up` (sem `make`: `docker compose up -d --build -V`). As tabelas são recriadas vazias.
4. Confira: `curl -s http://127.0.0.1:5194/health` → `{"ok":true,"db":true}` e `curl -s http://127.0.0.1:5194/api/planilhas` → `[]`.
5. Diga: "Pronto, o banco está zerado. Abra **http://localhost:5193** — o Início mostra 'Banco de dados: conectado'."

## Nunca
- Não rode `docker volume prune`, `docker system prune` ou apague volumes de **outros** projetos: use só `make reset` / `docker compose down -v` dentro desta pasta.
- Não resete sem avisar que apaga as planilhas salvas.
