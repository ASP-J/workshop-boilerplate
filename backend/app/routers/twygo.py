"""Conversa com a API da Twygo (somente LEITURA de usuários).

- O token fica no .env (TWYGO_API_TOKEN) e é usado SÓ aqui na cozinha.
  Ele NUNCA é devolvido para a tela nem impresso nos logs.
- GET /api/twygo/status            → {"configured": true|false}
- GET /api/twygo/users?all=true    → TODOS os usuários (todas as páginas, 100 por vez)
- GET /api/twygo/users?page=2      → só uma página
- Privacidade (LGPD): a tela recebe SÓ user_id, name, email e department de cada
  usuário. Telefone, endereço, CEP, documentos etc. ficam de fora (pick_user_fields).
  Precisa de outro campo? Adicione em pick_user_fields, com teste, e só se a tela usar.
"""

import os
from typing import Any

import httpx
from fastapi import APIRouter, Depends

from app.erros import ErroAmigavel

router = APIRouter(prefix="/api/twygo", tags=["twygo"])

DEFAULT_BASE_URL = "https://api.twygo.com"
PER_PAGE = 100
MAX_PAGES = 50  # trava de segurança: no máximo 5.000 usuários

MISSING_TOKEN_MESSAGE = (
    'O token da Twygo ainda não foi configurado. Peça ao Claude: "Crie o .env a partir do '
    '.env.example e abra o arquivo para eu colar o token". Cole o token no arquivo (nunca no chat), '
    'salve e diga "pronto".'
)
INVALID_TOKEN_MESSAGE = "A Twygo recusou o token: ele está inválido ou vencido. Peça um token novo ao João ou à Adriana."


def get_transport() -> httpx.AsyncBaseTransport | None:
    """Os testes trocam isto por um transporte falso (não chamam a Twygo de verdade)."""
    return None


def token_configurado(token: str | None) -> bool:
    """Existe um token de verdade (e não o texto de exemplo do .env.example)?"""
    texto = (token or "").strip()
    return bool(texto) and not texto.startswith("cole_o_")


def _texto(valor: Any) -> str:
    return "" if valor is None or isinstance(valor, (dict, list)) else str(valor).strip()


def pick_user_fields(user: dict) -> dict:
    """Fica só com os campos que as telas usam. Nada de telefone, endereço, CEP ou documentos."""
    user = user or {}
    nome = _texto(user.get("name")) or " ".join(p for p in (_texto(user.get("first_name")), _texto(user.get("last_name"))) if p)
    return {
        "user_id": user.get("user_id", user.get("id")),
        "name": nome,
        "email": _texto(user.get("email")),
        "department": _texto(user.get("department", user.get("sector"))),
    }


def _config() -> tuple[str, str]:
    token = os.getenv("TWYGO_API_TOKEN", "")
    if not token_configurado(token):
        raise ErroAmigavel(503, MISSING_TOKEN_MESSAGE, "TOKEN_MISSING")
    base_url = (os.getenv("TWYGO_API_BASE_URL") or DEFAULT_BASE_URL).rstrip("/")
    return token.strip(), base_url


async def _buscar_pagina(client: httpx.AsyncClient, base_url: str, token: str, page: int) -> dict:
    """Busca UMA página na Twygo e devolve {message, data: {users (enxutos), pagination}}."""
    try:
        resposta = await client.get(
            f"{base_url}/api/v2/users",
            params={"page": page, "per_page": PER_PAGE},
            headers={"Accept": "application/json", "Authorization": f"Bearer {token}"},
        )
    except httpx.TimeoutException:
        raise ErroAmigavel(504, "A Twygo demorou demais para responder. Tente de novo em instantes.", "TWYGO_TIMEOUT")
    except httpx.HTTPError:
        raise ErroAmigavel(502, "Não foi possível falar com a Twygo agora. Confira sua internet e tente de novo.", "TWYGO_UNREACHABLE")

    if resposta.status_code in (401, 403):
        raise ErroAmigavel(401, INVALID_TOKEN_MESSAGE, "TOKEN_INVALID")
    if resposta.status_code >= 400:
        raise ErroAmigavel(502, f"A Twygo respondeu com erro {resposta.status_code}. Tente de novo mais tarde.", "TWYGO_ERROR")
    try:
        corpo = resposta.json()
    except ValueError:
        raise ErroAmigavel(502, "A API da Twygo respondeu algo que não é JSON.", "TWYGO_ERROR")

    data = corpo.get("data") if isinstance(corpo, dict) else None
    users = data.get("users") if isinstance(data, dict) else None
    if not isinstance(users, list):
        raise ErroAmigavel(502, "A Twygo respondeu num formato inesperado (sem lista de usuários).", "TWYGO_ERROR")
    return {
        "message": corpo.get("message", ""),
        "data": {"users": [pick_user_fields(u) for u in users], "pagination": data.get("pagination") or {}},
    }


def _numero(valor: Any) -> int | None:
    try:
        return int(valor)
    except (TypeError, ValueError):
        return None


@router.get("/status")
def status():
    """Diz SE o token está configurado. Nunca devolve o token."""
    return {"configured": token_configurado(os.getenv("TWYGO_API_TOKEN"))}


@router.get("/users")
async def users(all: bool = False, page: int = 1, transport: httpx.AsyncBaseTransport | None = Depends(get_transport)):
    token, base_url = _config()
    async with httpx.AsyncClient(transport=transport, timeout=30) as client:
        if not all:
            return await _buscar_pagina(client, base_url, token, max(page, 1))

        todos: list[dict] = []
        ultima: dict = {}
        for pagina in range(1, MAX_PAGES + 1):
            ultima = await _buscar_pagina(client, base_url, token, pagina)
            lote = ultima["data"]["users"]
            todos.extend(lote)
            total_pages = _numero(ultima["data"]["pagination"].get("total_pages"))
            chegou_ao_fim = pagina >= total_pages if total_pages and total_pages > 0 else len(lote) < PER_PAGE
            if chegou_ao_fim or not lote:
                break

    paginacao = ultima.get("data", {}).get("pagination", {})
    total_entries = _numero(paginacao.get("total_entries"))
    return {
        "message": ultima.get("message", ""),
        "data": {
            "users": todos,
            "pagination": {
                "total_entries": total_entries if total_entries is not None else len(todos),
                "total_pages": _numero(paginacao.get("total_pages")),
            },
        },
    }
