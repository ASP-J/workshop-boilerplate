# Atalhos do sistema. Sem "make" (Windows)? Veja os comandos equivalentes no README.
.PHONY: up down logs ps reset test

# Liga tudo (banco + cozinha + tela). Reconstrói se as peças mudaram.
# -V renova as peças da tela (node_modules) quando o package.json muda.
up:
	docker compose up -d --build -V
	@echo ""
	@echo "Pronto! Abra http://localhost:5193 no navegador."
	@echo "(A documentação da cozinha fica em http://localhost:5194/docs)"

# Desliga tudo. As planilhas salvas no banco continuam guardadas.
down:
	docker compose down

# Mostra o que está acontecendo (Ctrl+C para sair).
logs:
	docker compose logs -f --tail=100

# Mostra o que está ligado.
ps:
	docker compose ps

# APAGA o banco local (todas as planilhas salvas) e desliga tudo.
# Use quando mudar uma tabela em backend/app/models.py ou quiser começar do zero.
reset:
	docker compose down -v

# Testes automáticos da cozinha (pytest) e da tela (vitest), dentro dos containers.
test:
	docker compose exec -T backend pytest
	docker compose exec -T frontend npm test
